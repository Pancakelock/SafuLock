// Sources flattened with hardhat v2.0.10 https://hardhat.org

// File 

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

// File contracts/PancakelockTokenVesting.sol

// SPDX-License-Identifier: UNLICENSED

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
    /*event OnTokenSecurityRatingChanged(address indexed token, uint8 indexed rating, string desc);*/
    event OnInstanceDestruction(address indexed instance, address receiver);
    event OnMinimalLockTimeChange(uint256 minimalLockTime);

    struct TokenLock {
        address instance;
        address token;
        address owner;
        uint256 unlockTime;
        uint256 lockedPlt;
    }

    address public masterContract;
    address payable public feeReceiver;
    IFeesCalculator public feesCalculator;
    IERC20 public feeToken;
    uint256 public minimalLockTime;

    uint256 private lockNonce = 0;

    uint256 private constant PERCENT_FACTOR = 1e4;
    /*    bytes32 private constant AUDITOR_ROLE = keccak256("AUDITOR");*/

    /*    mapping(address => uint8) public tokenSecurityRating;
    mapping(uint8 => string) public securityRatingDescription;*/
    mapping(address => EnumerableSet.UintSet) private userLocks;
    mapping(uint256 => TokenLock) public tokenLocks;

    /*    modifier onlyAuditor() {
        require(hasRole(AUDITOR_ROLE, msg.sender), "NOT AUDITOR");
        _;
    }*/

    modifier onlyLockOwner(uint256 lockId) {
        TokenLock storage lock = tokenLocks[lockId];
        require(
            lock.owner == address(msg.sender),
            "NO ACTIVE LOCK OR NOT OWNER"
        );
        _;
    }

    constructor(
        address _master,
        address _feesCalculator,
        address payable _feesReceiver,
        address _feeToken
    ) {
        require(
            _master != address(0) &&
                _feeToken != address(0) &&
                _feesCalculator != address(0) &&
                _feesReceiver != address(0),
            "ZERO ADDRESS"
        );

        masterContract = _master;
        feesCalculator = IFeesCalculator(_feesCalculator);
        feeReceiver = _feesReceiver;
        feeToken = IERC20(_feeToken);

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        /*_setupRole(AUDITOR_ROLE, msg.sender);*/
    }

    /**
     * @notice locks BEP20 token until specified time
     * @param token token address to lock
     * @param amount amount of tokens to lock
     * @param unlockTime unix time in seconds after that tokens can be withdrawn
     * @param withdrawer account that can withdraw tokens to it's balance
     * @param feePaymentMode 0 - pay fees in ETH + % of token,
     *                       1 - pay fees in PLT + % of token,
     *                       2 - pay fees fully in BNB,
     *                       3 - pay fees fully in PLT
     *                       4 - pay fees by locking PLT
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 unlockTime,
        address payable withdrawer,
        uint8 feePaymentMode
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

        (uint256 amountToLock, uint256 pltToLock) = _payFees(
            token,
            amount,
            unlockTime,
            feePaymentMode
        );
        lockId = _createLock(
            token,
            withdrawer,
            amountToLock,
            unlockTime,
            pltToLock
        );
    }

    /**
     * @notice token vesting
     * @param token token address to lock
     * @param amount overall amount of tokens to lock
     * @param percents[] array of amount percentage (1e4 = 100%). Sum must be 100%
     * @param unlockTimes[] sorted array of unix times in seconds, must be same length as percents[]
     * @param withdrawer account that can withdraw tokens to it's balance
     * @param feePaymentMode 0 - pay fees in ETH + % of token,
     *                       1 - pay fees in PLT + % of token,
     *                       2 - pay fees fully in BNB,
     *                       3 - pay fees fully in PLT
     *                       4 - pay fees by locking PLT
     */
    function vestTokens(
        address token,
        uint256 amount,
        uint256[] memory percents,
        uint256[] memory unlockTimes,
        address payable withdrawer,
        uint8 feePaymentMode
    ) external payable nonReentrant {
        require(percents.length == unlockTimes.length, "ARRAY SIZES MISMATCH");
        require(percents.length >= 2, "LOW LOCKS COUNT");
        require(amount > 0, "ZERO AMOUNT");
        require(withdrawer != address(0), "ZERO WITHDRAWER");
        require(
            unlockTimes[0] > block.timestamp + minimalLockTime,
            "TOO SMALL UNLOCK TIME"
        );

        (uint256 amountToLock, uint256 pltToLock) = _payFees(
            token,
            amount,
            unlockTimes[unlockTimes.length - 1],
            feePaymentMode
        );

        uint256 percentsOverall = percents[0];

        //first lock
        (
            uint256 remainingAmount,
            uint256 remainingPltToLock
        ) = createVestingItem(
            token,
            withdrawer,
            amountToLock,
            pltToLock,
            percents[0],
            unlockTimes[0],
            amountToLock,
            pltToLock
        );

        for (uint32 i = 1; i < unlockTimes.length - 1; i++) {
            require(
                unlockTimes[i] > unlockTimes[i - 1],
                "UNSORTED UNLOCK TIMES"
            );

            (remainingAmount, remainingPltToLock) = createVestingItem(
                token,
                withdrawer,
                amountToLock,
                pltToLock,
                percents[i],
                unlockTimes[i],
                remainingAmount,
                remainingPltToLock
            );

            percentsOverall = percentsOverall.add(percents[i]);
        }
        _createLock(
            token,
            withdrawer,
            remainingAmount,
            unlockTimes[unlockTimes.length - 1],
            remainingPltToLock
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
        uint256 pltToLock,
        uint256 percent,
        uint256 unlockTime,
        uint256 remainingAmount,
        uint256 remainingPltAmount
    ) private returns (uint256, uint256) {
        uint256 currentLockAmount = amountToLock.mul(percent).div(
            PERCENT_FACTOR
        );
        uint256 currentPltToLock = pltToLock.mul(percent).div(PERCENT_FACTOR);
        _createLock(
            token,
            withdrawer,
            currentLockAmount,
            unlockTime,
            currentPltToLock
        );
        return (
            remainingAmount.sub(currentLockAmount),
            remainingPltAmount.sub(currentPltToLock)
        );
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
        uint256 unlockTime,
        uint256 lockedPlt
    ) private returns (uint256) {
        address instance = createInstance(token);
        uint256 lockId = lockNonce++;
        TokenLock memory lock = TokenLock({
            owner: owner,
            instance: instance,
            token: token,
            unlockTime: unlockTime,
            lockedPlt: lockedPlt
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
        uint256 unlockTime,
        uint8 feePaymentMode
    ) private returns (uint256, uint256) {
        (
            uint256 ethFee,
            uint256 systemTokenFee,
            uint256 tokenFee,
            uint256 pltLockAmount
        ) = feesCalculator.calculateFees(
            token,
            amount,
            unlockTime,
            feePaymentMode
        );
        require(tokenFee <= amount.div(100), "TOKEN FEE EXCEEDS 1%");
        //safeguard for token fee
        transferFees(token, ethFee, systemTokenFee, tokenFee, pltLockAmount);
        if (msg.value > ethFee) {
            // transfer excess back
            transferBnb(msg.sender, msg.value.sub(ethFee));
        }
        return (amount.sub(tokenFee), pltLockAmount);
    }

    function transferFees(
        address token,
        uint256 ethFee,
        uint256 systemTokenFee,
        uint256 tokenFee,
        uint256 pltLockAmount
    ) private {
        if (ethFee > 0) {
            require(msg.value >= ethFee, "ETH FEES NOT MET");
            transferBnb(feeReceiver, ethFee);
        }
        if (systemTokenFee > 0) {
            require(
                feeToken.allowance(msg.sender, address(this)) >= systemTokenFee,
                "SYSTEM TOKEN FEE NOT MET"
            );
            feeToken.safeTransferFrom(msg.sender, feeReceiver, systemTokenFee);
        }
        if (tokenFee > 0) {
            require(
                IERC20(token).allowance(msg.sender, address(this)) >= tokenFee,
                "TOKEN FEE NOT MET"
            );
            IERC20(token).safeTransferFrom(msg.sender, feeReceiver, tokenFee);
        }
        if (pltLockAmount > 0) {
            feeToken.safeTransferFrom(msg.sender, address(this), pltLockAmount);
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
     * @param feePaymentMode fee payment mode
     */
    function increaseLockAmount(
        uint256 lockId,
        uint256 amountToIncrement,
        uint8 feePaymentMode
    ) external payable nonReentrant onlyLockOwner(lockId) {
        require(amountToIncrement > 0, "ZERO AMOUNT");
        TokenLock storage lock = tokenLocks[lockId];

        (
            uint256 ethFee,
            uint256 systemTokenFee,
            uint256 tokenFee,
            uint256 pltLockAmount
        ) = feesCalculator.calculateIncreaseAmountFees(
            lock.token,
            amountToIncrement,
            lock.unlockTime,
            feePaymentMode
        );
        require(tokenFee <= amountToIncrement.div(100), "TOKEN FEE EXCEEDS 1%");
        //safeguard for token fee
        transferFees(
            lock.token,
            ethFee,
            systemTokenFee,
            tokenFee,
            pltLockAmount
        );
        if (msg.value > ethFee) {
            // transfer excess back
            transferBnb(msg.sender, msg.value.sub(ethFee));
        }

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
            if (lock.lockedPlt > 0) {
                feeToken.safeTransfer(lock.owner, lock.lockedPlt);
            }
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

    /*
    function getTokenSecurityRating(address token) external view returns (string memory) {
        return securityRatingDescription[tokenSecurityRating[token]];
    }*/

    function transferBnb(address recipient, uint256 amount) private {
        (bool res, ) = recipient.call{value: amount}("");
        require(res, "BNB TRANSFER FAILED");
    }

    /*    function setTokenSecurityRating(address token, uint8 rating, string memory comment) external onlyAuditor {
        require(bytes(securityRatingDescription[rating]).length > 0, "INVALID SECURITY RATING");
        tokenSecurityRating[token] = rating;
        emit OnTokenSecurityRatingChanged(token, rating, comment);
    }*/

    /**
     * @notice sets new contract to calculate fees
     * @param newFeesCalculator address of new fees calculator contract
     */
    function setFeesCalculator(address newFeesCalculator) external onlyOwner {
        require(newFeesCalculator != address(0), "ZERO ADDRESS");
        feesCalculator = IFeesCalculator(newFeesCalculator);
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

    /*    function setSecurityRatingDescription(uint8 rating, string memory description) external onlyOwner {
        securityRatingDescription[rating] = description;
    }
*/
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
