// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

interface IPancakelockTokenVault {
    function init(address) external returns (bool);

    function destruct(address) external;
}

//ERC20 token locker and vesting

contract PancakelockTokenVesting is Ownable, AccessControl, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    //STUCTURES:-----------------------------------------------------

    struct VestingItem {
        address token;
        address owner;
        address instance;
        uint256 amount;
        uint256[] percents;
        uint256 lockTime;
        uint256[] unlockTimes;
    }

    //EVENTS:--------------------------------------------------------

    event OnVestingCreate(
        uint256 indexed id,
        address instanceAddress,
        address indexed tokenAddress,
        address indexed owner,
        uint256 amount,
        uint256 lockTime
    );
    event OnInstanceInit(
        address indexed vestedToken,
        address indexed vestingAddress
    );
    event OnVestingWithdrawal(uint256 indexed vestingId);
    event OnPartWithdrawal(uint256 indexed vestingId, uint256 indexOfPart);
    event OnVestingOwnershipTransferred(
        uint256 indexed lockId,
        address indexed newOwner
    );
    event OnInstanceDestruction(address indexed instance, address receiver);
    event OnMinimalLockTimeChange(uint256 minimalLockTime);

    //FIELDS:--------------------------------------------------------

    address public masterContract;
    address payable public feeReceiver;
    uint256 public minimalLockTime;

    uint256 public bnbFee = 1 ether;
    uint256 public tokenFeePercent = 5; // 100% = 1000

    uint256 private lastId;

    mapping(uint256 => VestingItem) public vestings;
    mapping(address => EnumerableSet.UintSet) private userVestings;

    //MODIFIERS:-----------------------------------------------------

    modifier onlyVestingOwner(uint256 id) {
        VestingItem storage vesting = vestings[id];
        require(
            vesting.owner == address(msg.sender),
            "NO ACTIVE VESTING OR NOT OWNER"
        );
        _;
    }

    modifier isVestingCorrect(
        address token,
        uint256 amount,
        uint256[] memory percents,
        uint256[] memory unlockTimes,
        address payable withdrawer
    ) {
        require(percents.length == unlockTimes.length, "ARRAY SIZES MISMATCH");
        require(percents.length >= 2, "LOW LOCKS COUNT");
        require(amount > 0, "ZERO AMOUNT");
        require(withdrawer != address(0), "ZERO WITHDRAWER");
        require(token != address(0), "ZERO TOKEN");
        require(
            unlockTimes[0] > block.timestamp + minimalLockTime,
            "TOO SMALL UNLOCK TIME"
        );
        require(
            unlockTimes[unlockTimes.length - 1] < 10000000000,
            "INVALID UNLOCK TIME, MUST BE UNIX TIME IN SECONDS"
        );
        _;
    }

    //CONSTRUCTOR:---------------------------------------------------

    constructor(address _master, address payable _feesReceiver) {
        require(
            _master != address(0) && _feesReceiver != address(0),
            "ZERO ADDRESS"
        );

        masterContract = _master;
        feeReceiver = _feesReceiver;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    //EXTERNAL AND PUBLIC FUNCTIONS:

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
    )
        external
        payable
        nonReentrant
        isVestingCorrect(token, amount, percents, unlockTimes, withdrawer)
    {
        uint256 amountToLock = _payFees(token, amount, isFeeInBNB);
        address instance = createInstance(token);
        uint256 id = lastId++;
        vestings[id] = VestingItem({
            token: token,
            owner: withdrawer,
            instance: instance,
            amount: amountToLock,
            percents: percents,
            lockTime: block.timestamp,
            unlockTimes: unlockTimes
        });

        userVestings[withdrawer].add(id);
        IERC20(token).transferFrom(msg.sender, instance, amountToLock);
        emit OnVestingCreate(
            id,
            instance,
            token,
            withdrawer,
            amountToLock,
            block.timestamp
        );
    }

    /**
     * @notice withdraw all tokens from lock. Current time must be greater than unlock time
     * @param lockIndex lock index to withdraw
     */
    function withdraw(uint256 vestingId, uint256 lockIndex)
        external
        nonReentrant
        onlyVestingOwner(vestingId)
    {
        VestingItem storage vesting = vestings[vestingId];
        require(vesting.owner != address(0), "NO ACTIVE VESTING");
        require(
            block.timestamp >= vesting.unlockTimes[lockIndex],
            "NOT YET UNLOCKED"
        );
        require(vesting.percents[lockIndex] != 0, "This lock also withdrawn");

        uint256 unlockedAmount = (vesting.amount *
            vesting.percents[lockIndex]) / 1000;
        IERC20(vesting.token).transferFrom(
            vesting.instance,
            vesting.owner,
            unlockedAmount
        );
        vesting.percents[lockIndex] = 0;
        uint256 currentBalance = IERC20(vesting.token).balanceOf(
            vesting.instance
        );
        if (currentBalance == 0) {
            destroyInstance(vesting.instance, vesting.owner);
            userVestings[vesting.owner].remove(vestingId);
            delete vestings[vestingId];

            emit OnVestingWithdrawal(vestingId);
        } else {
            emit OnPartWithdrawal(vestingId, lockIndex);
        }
    }

    /**
     * @notice transfer lock ownership to another account
     * @param vestingId lock id to transfer
     * @param newOwner account to transfer lock
     */
    function transferVestingOwnership(uint256 vestingId, address newOwner)
        external
        onlyVestingOwner(vestingId)
    {
        require(newOwner != address(0), "ZERO NEW OWNER");
        VestingItem storage item = vestings[vestingId];
        userVestings[item.owner].remove(vestingId);
        userVestings[newOwner].add(vestingId);
        item.owner = newOwner;
        emit OnVestingOwnershipTransferred(vestingId, newOwner);
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
     * @notice get user's vestings number
     * @param user user's address
     */
    function getNumOfUsersVestings(address user)
        external
        view
        returns (uint256)
    {
        return userVestings[user].length();
    }

    /**
     * @notice get user's vesting id by index
     * @param user user's address
     * @param index vesting index
     */
    function userVestingAt(address user, uint256 index)
        external
        view
        returns (uint256)
    {
        return userVestings[user].at(index);
    }

    function getLastId() external view returns (uint256) {
        return lastId;
    }

    function getNumOfUnlockedParts(uint256 vestingId)
        public
        view
        returns (uint256 result)
    {
        uint256 nowTime = block.timestamp;
        uint256[] memory unlockTimes = vestings[vestingId].unlockTimes;

        for (uint256 i = 0; i < unlockTimes.length; i++) {
            if (unlockTimes[i] < nowTime) break;
            result++;
        }
    }

    function getVestingInfo(uint256 vestingId)
        external
        view
        returns (
            address token,
            address owner,
            address instance,
            uint256 amount,
            uint256[] memory percents,
            uint256 lockTime,
            uint256[] memory unlockTimes
        )
    {
        VestingItem memory item = vestings[vestingId];
        token = item.token;
        owner = item.owner;
        instance = item.instance;
        amount = item.amount;
        percents = item.percents;
        lockTime = item.lockTime;
        unlockTimes = item.unlockTimes;
    }

    //PRIVATE AND INTERNAL FUCTIONS:---------------------------------

    function createInstance(address token) private returns (address) {
        address instance = Clones.clone(masterContract);
        require(IPancakelockTokenVault(instance).init(token), "DEPLOY FAILED");

        emit OnInstanceInit(token, instance);
        return instance;
    }

    function _payFees(
        address token,
        uint256 amount,
        bool isFeeInBNB
    ) private returns (uint256) {
        uint256 tokenFee = (amount * tokenFeePercent) / 1000;
        transferFees(token, tokenFee, isFeeInBNB);
        return amount - tokenFee;
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
                transferBnb(msg.sender, msg.value - bnbFee);
            }
        } else {
            if (tokenFee > 0) {
                require(
                    IERC20(token).allowance(msg.sender, address(this)) >=
                        tokenFee,
                    "TOKEN FEE NOT MET"
                );
                IERC20(token).transferFrom(msg.sender, feeReceiver, tokenFee);
            }
        }
    }

    function transferBnb(address recipient, uint256 amount) private {
        (bool res, ) = recipient.call{value: amount}("");
        require(res, "BNB TRANSFER FAILED");
    }

    function destroyInstance(address instance, address receiver) private {
        IPancakelockTokenVault(instance).destruct(receiver);

        emit OnInstanceDestruction(instance, receiver);
    }
}
