// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

interface IPancakelockTokenVault {
    function init(address) external returns (bool);

    function destruct(address) external;
}

interface IFeesCalculator {
    function calculateFees(
        address token,
        uint256 amount,
        uint256 unlockTime,
        uint8 paymentMode
    )
        external
        view
        returns (
            uint256 ethFee,
            uint256 systemTokenFee,
            uint256 tokenFee,
            uint256 lockAmount
        );

    function calculateIncreaseAmountFees(
        address token,
        uint256 amount,
        uint256 unlockTime,
        uint8 paymentMode
    )
        external
        view
        returns (
            uint256 ethFee,
            uint256 systemTokenFee,
            uint256 tokenFee,
            uint256 lockAmount
        );
}


//ERC20 token locker and vesting

contract PancakelockTokenVesting is Ownable, AccessControl, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    event OnTokenLock(
        uint256 indexed lockId,
        address instanceAddress,
        address indexed tokenAddress,
        address indexed owner,
        uint256 amount,
        uint256 unlockTime
    );
    event OnInstanceInit(
        address indexed vestedToken,
        address indexed vestingAddress
    );
    event OnTokenUnlock(uint256 indexed lockId);
    event OnLockWithdrawal(uint256 indexed lockId, uint256 amount);
    event OnLockAmountIncreased(uint256 indexed lockId, uint256 amount);
    event OnLockDurationIncreased(
        uint256 indexed lockId,
        uint256 newUnlockTime
    );
    event OnLockOwnershipTransferred(
        uint256 indexed lockId,
        address indexed newOwner
    );
    event OnInstanceDestruction(address indexed instance, address receiver);
    event OnMinimalLockTimeChange(uint256 minimalLockTime);

    struct TokenLock {
        address instance;
        address token;
        address owner;
        uint256 unlockTime;
    }

    address public masterContract;
    address payable public feeReceiver;
    uint256 public minimalLockTime;

    uint256 public bnbFee = 1 ether;
    uint256 public tokenFeePercent = 5; // 100% = 1000

    uint256 private lockNonce = 0;

    uint256 private constant PERCENT_FACTOR = 1e4;
    mapping(address => EnumerableSet.UintSet) private userLocks;
    mapping(uint256 => TokenLock) public tokenLocks;

    modifier onlyLockOwner(uint256 lockId) {
        TokenLock storage lock = tokenLocks[lockId];
        require(
            lock.owner == address(msg.sender),
            "NO ACTIVE LOCK OR NOT OWNER"
        );
        _;
    }

    constructor(address _master, address payable _feesReceiver) {
        require(
            _master != address(0) && _feesReceiver != address(0),
            "ZERO ADDRESS"
        );

        masterContract = _master;
        feeReceiver = _feesReceiver;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice locks BEP20 token until specified time
     * @param token token address to lock
     * @param amount amount of tokens to lock
     * @param unlockTime unix time in seconds after that tokens can be withdrawn
     * @param withdrawer account that can withdraw tokens to it's balance
     * @param isFeeInBNB true - pay fees fully in BNB,
     *                   false - pay fees fully in % of token
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 unlockTime,
        address payable withdrawer,
        bool isFeeInBNB
    ) external payable nonReentrant returns (uint256 lockId) {
        require(amount > 0, "ZERO AMOUNT");
        require(token != address(0), "ZERO TOKEN");
        require(withdrawer != address(0), "ZERO WITHDRAWER");
        require(
            unlockTime > block.timestamp + minimalLockTime,
            "TOO SMALL UNLOCK TIME"
        );
        require(
            unlockTime < 10000000000,
            "INVALID UNLOCK TIME, MUST BE UNIX TIME IN SECONDS"
        );
        uint256 amountToLock = _payFees(
            token,
            amount,
            isFeeInBNB
        );
        lockId = _createLock(
            token,
            withdrawer,
            amountToLock,
            unlockTime
        );
    }

    /**
     * @notice token vesting
     * @param token token address to lock
     * @param amount overall amount of tokens to lock
     * @param percents[] array of amount percentage (1e4 = 100%). Sum must be 100%
     * @param unlockTimes[] sorted array of unix times in seconds, must be same length as percents[]
     * @param withdrawer account that can withdraw tokens to it's balance
     * @param isFeeInBNB true - pay fees fully in BNB,
     *                   false - pay fees fully in % of token
     */
    function vestTokens(
        address token,
        uint256 amount,
        uint256[] memory percents,
        uint256[] memory unlockTimes,
        address payable withdrawer,
        bool isFeeInBNB
    ) external payable nonReentrant {
        require(percents.length == unlockTimes.length, "ARRAY SIZES MISMATCH");
        require(percents.length >= 2, "LOW LOCKS COUNT");
        require(amount > 0, "ZERO AMOUNT");
        require(withdrawer != address(0), "ZERO WITHDRAWER");
        require(
            unlockTimes[0] > block.timestamp + minimalLockTime,
            "TOO SMALL UNLOCK TIME"
        );

        uint256 amountToLock = _payFees(
            token,
            amount,
            isFeeInBNB
        );

        uint256 percentsOverall = percents[0];

        //first lock
        uint256 remainingAmount = createVestingItem(
            token,
            withdrawer,
            amountToLock,
            percents[0],
            unlockTimes[0],
            amountToLock
        );

        for (uint32 i = 1; i < unlockTimes.length - 1; i++) {
            require(
                unlockTimes[i] > unlockTimes[i - 1],
                "UNSORTED UNLOCK TIMES"
            );

            remainingAmount = createVestingItem(
                token,
                withdrawer,
                amountToLock,
                percents[i],
                unlockTimes[i],
                remainingAmount
            );

            percentsOverall = percentsOverall.add(percents[i]);
        }
        _createLock(
            token,
            withdrawer,
            remainingAmount,
            unlockTimes[unlockTimes.length - 1]
        );
        require(
            percentsOverall.add(percents[percents.length - 1]) ==
                PERCENT_FACTOR,
            "INVALID PERCENTS"
        );

        require(
            unlockTimes[unlockTimes.length - 1] < 10000000000,
            "INVALID UNLOCK TIME, MUST BE UNIX TIME IN SECONDS"
        );
    }

    //helper function for stack depth optimization
    function createVestingItem(
        address token,
        address withdrawer,
        uint256 amountToLock,
        uint256 percent,
        uint256 unlockTime,
        uint256 remainingAmount
    ) private returns (uint256) {
        uint256 currentLockAmount = amountToLock.mul(percent).div(
            PERCENT_FACTOR
        );

        _createLock(token, withdrawer, currentLockAmount, unlockTime);
        return remainingAmount.sub(currentLockAmount);
    }

    function createInstance(address token) private returns (address) {
        address instance = Clones.clone(masterContract);
        require(IPancakelockTokenVault(instance).init(token), "DEPLOY FAILED");

        emit OnInstanceInit(token, instance);
        return instance;
    }

    function _createLock(
        address token,
        address owner,
        uint256 amount,
        uint256 unlockTime
    ) private returns (uint256) {
        address instance = createInstance(token);
        uint256 lockId = lockNonce++;
        TokenLock memory lock = TokenLock({
            owner: owner,
            instance: instance,
            token: token,
            unlockTime: unlockTime
        });
        tokenLocks[lockId] = lock;
        userLocks[owner].add(lockId);
        IERC20(token).safeTransferFrom(msg.sender, instance, amount);

        emit OnTokenLock(lockId, instance, token, owner, amount, unlockTime);
        return lockId;
    }

    function _payFees(
        address token,
        uint256 amount,
        bool isFeeInBNB
    ) private returns (uint256) {
        uint256 tokenFee = amount.mul(tokenFeePercent).div(1000);
        transferFees(token, tokenFee, isFeeInBNB);
        return amount.sub(tokenFee);
    }

    function transferFees(
        address token,
        uint256 tokenFee,
        bool isFeeInBNB
    ) private {
        if (isFeeInBNB) {
            if (bnbFee > 0) {
                require(msg.value >= bnbFee, "BNB FEES NOT MET");
                transferBnb(feeReceiver, bnbFee);
            }
            if (msg.value > bnbFee) {
                // transfer excess back
                transferBnb(msg.sender, msg.value.sub(bnbFee));
            }
        } else {
            if (tokenFee > 0) {
                require(
                    IERC20(token).allowance(msg.sender, address(this)) >=
                        tokenFee,
                    "TOKEN FEE NOT MET"
                );
                IERC20(token).safeTransferFrom(
                    msg.sender,
                    feeReceiver,
                    tokenFee
                );
            }
        }
    }

    function extendLockTime(uint256 lockId, uint256 newUnlockTime)
        external
        nonReentrant
        onlyLockOwner(lockId)
    {
        require(newUnlockTime > block.timestamp, "UNLOCK TIME IN THE PAST");
        require(
            newUnlockTime < 10000000000,
            "INVALID UNLOCK TIME, MUST BE UNIX TIME IN SECONDS"
        );
        TokenLock storage lock = tokenLocks[lockId];
        require(lock.unlockTime < newUnlockTime, "NOT INCREASING UNLOCK TIME");
        lock.unlockTime = newUnlockTime;

        emit OnLockDurationIncreased(lockId, newUnlockTime);
    }

    /**
     * @notice add tokens to an existing lock
     * @param amountToIncrement tokens amount to add
     * @param isFeeInBNB true - pay fees fully in BNB,
     *                   false - pay fees fully in % of token
     */
    function increaseLockAmount(
        uint256 lockId,
        uint256 amountToIncrement,
        bool isFeeInBNB
    ) external payable nonReentrant onlyLockOwner(lockId) {
        require(amountToIncrement > 0, "ZERO AMOUNT");
        TokenLock storage lock = tokenLocks[lockId];
        uint256 tokenFee = amountToIncrement.mul(tokenFeePercent).div(1000);
        //require(tokenFee <= amountToIncrement.div(100), "TOKEN FEE EXCEEDS 1%");
        //safeguard for token fee
        transferFees(lock.token, tokenFee, isFeeInBNB);

        uint256 actualIncrementAmount = amountToIncrement.sub(tokenFee);
        IERC20(lock.token).safeTransferFrom(
            msg.sender,
            lock.instance,
            actualIncrementAmount
        );
        emit OnLockAmountIncreased(lockId, amountToIncrement);
    }

    /**
     * @notice withdraw all tokens from lock. Current time must be greater than unlock time
     * @param lockId lock id to withdraw
     */
    function withdraw(uint256 lockId) external {
        TokenLock storage lock = tokenLocks[lockId];
        require(lock.owner != address(0), "NO ACTIVE LOCK");
        withdrawPartially(lockId, IERC20(lock.token).balanceOf(lock.instance));
    }

    /**
     * @notice withdraw specified amount of tokens from lock. Current time must be greater than unlock time
     * @param lockId lock id to withdraw tokens from
     * @param amount amount of tokens to withdraw
     */
    function withdrawPartially(uint256 lockId, uint256 amount)
        public
        nonReentrant
        onlyLockOwner(lockId)
    {
        TokenLock storage lock = tokenLocks[lockId];
        require(block.timestamp >= lock.unlockTime, "NOT YET UNLOCKED");

        IERC20(lock.token).safeTransferFrom(lock.instance, lock.owner, amount);

        uint256 currentBalance = IERC20(lock.token).balanceOf(lock.instance);
        if (currentBalance == 0) {
            // if (lock.lockedPlt > 0) {
            //     feeToken.safeTransfer(lock.owner, lock.lockedPlt);
            // }
            //clean up storage to save gas
            destroyInstance(lock.instance, lock.owner);
            userLocks[lock.owner].remove(lockId);
            delete tokenLocks[lockId];

            emit OnTokenUnlock(lockId);
        } else {
            emit OnLockWithdrawal(lockId, amount);
        }
    }

    /**
     * @notice transfer lock ownership to another account
     * @param lockId lock id to transfer
     * @param newOwner account to transfer lock
     */
    function transferLock(uint256 lockId, address newOwner)
        external
        onlyLockOwner(lockId)
    {
        require(newOwner != address(0), "ZERO NEW OWNER");
        TokenLock storage lock = tokenLocks[lockId];
        userLocks[lock.owner].remove(lockId);
        userLocks[newOwner].add(lockId);
        lock.owner = newOwner;
        emit OnLockOwnershipTransferred(lockId, newOwner);
    }

    function transferBnb(address recipient, uint256 amount) private {
        (bool res, ) = recipient.call{value: amount}("");
        require(res, "BNB TRANSFER FAILED");
    }
    
    /**
     * @notice sets new beneficiary
     * @param newFeeReceiver address of new fees receiver
     */
    function setFeeReceiver(address payable newFeeReceiver) external onlyOwner {
        require(newFeeReceiver != address(0), "ZERO ADDRESS");
        feeReceiver = newFeeReceiver;
    }

    function setMinimalLockTime(uint256 newMinimalLockTime) external onlyOwner {
        minimalLockTime = newMinimalLockTime;
        emit OnMinimalLockTimeChange(newMinimalLockTime);
    }
    
    /**
     * @notice get user's locks number
     * @param user user's address
     */
    function userLocksLength(address user) external view returns (uint256) {
        return userLocks[user].length();
    }

    /**
     * @notice get user lock id at specified index
     * @param user user's address
     * @param index index of lock id
     */
    function userLockAt(address user, uint256 index)
        external
        view
        returns (uint256)
    {
        return userLocks[user].at(index);
    }

    function destroyInstance(address instance, address receiver) private {
        IPancakelockTokenVault(instance).destruct(receiver);

        emit OnInstanceDestruction(instance, receiver);
    }
}
