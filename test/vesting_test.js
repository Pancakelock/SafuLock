const { expect } = require("chai");

const Vesting = artifacts.require('PancakelockTokenVesting');
const Token = artifacts.require('PancakelockToken');
const Master = artifacts.require("PancakelockTokenVault");

//const Web3 = require("web3");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { BN } = require('@openzeppelin/test-helpers');

const FIVE = new BN(5);
const TEN = new BN(10);
const DECIMALS = new BN(18);

const ONE_BNB = TEN.pow(DECIMALS);


contract('Vesting', ([deployer, feeReciever, withdrawer, user2]) => {
    let vesting, token, master;
    let vestingAddress, tokenAddress, masterAddress;
    let timestamp;


    beforeEach(async () => {
        token = await Token.new({ from: deployer });
        tokenAddress = await token.address;

        master = await Master.new({ from: deployer });
        masterAddress = await master.address;

        vesting = await Vesting.new(masterAddress, feeReciever, { from: deployer });
        vestingAddress = await vesting.address;


        const block = await web3.eth.getBlock("latest");
        timestamp = await block['timestamp'];
    })
    it('bnb fee should be 1 bnb', async () => {
        const bnbFee = await vesting.bnbFee();
        expect(bnbFee).bignumber.equal(ONE_BNB);
    });
    it('token fee should be 0.5%', async () => {
        const tokenFee = await vesting.tokenFeePercent();
        expect(tokenFee).bignumber.equal(FIVE);
    });
    it('is lock creating', async () => {
        const unlockTime = new BN(timestamp + 10);
        const unlockAmount = new BN(10000);

        await token.transfer(withdrawer, unlockAmount, { from: deployer });
        await token.approve(vestingAddress, unlockAmount, { from: withdrawer });
        await vesting.lockTokens(tokenAddress, unlockAmount, unlockTime, withdrawer, false, { from: withdrawer });
        const lockId = await vesting.userLockAt.call(withdrawer, new BN(0));
        const tokenLock = await vesting.tokenLocks(lockId);
        expect(tokenLock.token).equal(tokenAddress);
        expect(tokenLock.owner).equal(withdrawer);
        expect(tokenLock.unlockTime).bignumber.equal(unlockTime);
    });

});