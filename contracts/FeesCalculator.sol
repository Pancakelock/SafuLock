// Sources flattened with hardhat v2.0.10 https://hardhat.org

// File contracts/IFeesCalculator.sol

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract FeesCalculator is Ownable, IFeesCalculator {
    using SafeMath for uint256;

    uint256 public ethMin = 1 ether;
    uint256 public tokenMin = 28 ether;
    uint256 public ethMax = 23 ether; // ~$5000 for 2021/02/28
    uint256 public tokenMax = 103.5 ether; // 0.75*ethMax for 2021/02/28
    uint256 public liquidityPercent = 50; // 0.5%
    uint256 public pltLockAmount = 134 ether; // 134 PLT

    uint8 public PAYMENT_MODE_BNB_LP_TOKEN = 0;
    uint8 public PAYMENT_MODE_PLT_LP_TOKEN = 1;
    uint8 public PAYMENT_MODE_BNB_MAX = 2;
    uint8 public PAYMENT_MODE_PLT_MAX = 3;
    uint8 public PAYMENT_MODE_LOCK_TOKENS = 4;

    event OnFeeChanged(
        uint256 ethMin,
        uint256 tokenMin,
        uint256 ethMax,
        uint256 tokenMax,
        uint256 liquidityPercent,
        uint256 lockAmount
    );

    /**
     * @notice Calculates lock fees based on input params
     * @param amount amount of tokens to lock
     * @param paymentMode    0 - pay fees in minBNB + LP token,
     *                       1 - pay fees in minPLT + LP token,
     *                       2 - pay fees fully in maxBNB,
     *                       3 - pay fees fully in maxPLT
     *                       4 - pay fees by locking PLT
     */
    function calculateFees(
        address lpToken,
        uint256 amount,
        uint256 unlockTime,
        uint8 paymentMode
    )
        external
        view
        override
        returns (
            uint256 ethFee,
            uint256 tokenFee,
            uint256 lpTokenFee,
            uint256 pltAmount
        )
    {
        require(paymentMode <= 4, "INVALID PAYMENT METHOD");
        if (paymentMode == PAYMENT_MODE_BNB_LP_TOKEN) {
            return (ethMin, 0, liquidityPercent.mul(amount).div(1e4), 0);
        }
        if (paymentMode == PAYMENT_MODE_PLT_LP_TOKEN) {
            return (0, tokenMin, liquidityPercent.mul(amount).div(1e4), 0);
        }
        if (paymentMode == PAYMENT_MODE_BNB_MAX) {
            return (ethMax, 0, 0, 0);
        }
        if (paymentMode == PAYMENT_MODE_LOCK_TOKENS) {
            return (0, 0, 0, pltLockAmount);
        }
        return (0, tokenMax, 0, 0);
    }

    /**
     * @notice Calculates increase lock amount fees based on input params
     * @param amount amount of tokens to lock
     * @param paymentMode    0 - pay fees in minBNB + LP token,
     *                       1 - pay fees in minPLT + LP token,
     *                       2 - pay fees fully in maxBNB,
     *                       3 - pay fees fully in maxPLT
     *                       4 - pay fees by locking PLT
     */
    function calculateIncreaseAmountFees(
        address lpToken,
        uint256 amount,
        uint256 unlockTime,
        uint8 paymentMode
    )
        external
        view
        override
        returns (
            uint256 ethFee,
            uint256 tokenFee,
            uint256 lpTokenFee,
            uint256 tokenAmountToLock
        )
    {
        require(paymentMode <= 4, "INVALID PAYMENT METHOD");
        if (paymentMode == PAYMENT_MODE_BNB_MAX) {
            return (ethMax, 0, 0, 0);
        }
        if (paymentMode == PAYMENT_MODE_PLT_MAX) {
            return (0, tokenMax, 0, 0);
        }
        if (paymentMode == PAYMENT_MODE_LOCK_TOKENS) {
            return (0, 0, 0, 0);
        }
        return (0, 0, liquidityPercent.mul(amount).div(1e4), 0);
    }

    function getFees()
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }

    function setEthMin(uint256 _ethMin) external onlyOwner {
        ethMin = _ethMin;

        emit OnFeeChanged(
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }

    function setTokenMin(uint256 _tokenMin) external onlyOwner {
        tokenMin = _tokenMin;

        emit OnFeeChanged(
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }

    function setEthMax(uint256 _ethMax) external onlyOwner {
        ethMax = _ethMax;

        emit OnFeeChanged(
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }

    function setTokenMax(uint256 _tokenMax) external onlyOwner {
        tokenMax = _tokenMax;

        emit OnFeeChanged(
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }

    function setPltLockAmount(uint256 _pltLockAmount) external onlyOwner {
        pltLockAmount = _pltLockAmount;

        emit OnFeeChanged(
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }

    function setLiquidityPercent(uint256 _liquidityPercent) external onlyOwner {
        liquidityPercent = _liquidityPercent;

        emit OnFeeChanged(
            ethMin,
            tokenMin,
            ethMax,
            tokenMax,
            liquidityPercent,
            pltLockAmount
        );
    }
}
