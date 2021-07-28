const { expect } = require("chai");

const Locker = artifacts.require('PancakelockLocker');
const Token = artifacts.require('PancakelockToken');

const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');


const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);
const THREE = new BN(3);
const FOUR = new BN(4);
const FIVE = new BN(5);
const TEN = new BN(10);
const DECIMALS = new BN(18);

const ONE_BNB = TEN.pow(DECIMALS);

const lockAmount = new BN(10000);


contract('Locker', ([deployer, withdrawer]) => {
    let locker, token1, token2;
    let lockerAddress, token1Address, token2Address;
    let timestamp;

    beforeEach(async () => {
        locker = await Locker.new({ from: deployer });
        lockerAddress = await locker.address;

        token1 = await Token.new({ from: deployer });
        token1Address = await token1.address;

        token2 = await Token.new({ from: deployer });
        token2Address = await token2.address;

        const block = await web3.eth.getBlock("latest");
        timestamp = await block['timestamp'];
    });

    it("is token whitelisted and unwhitelisted correctly", async () => {
        //Whitelisting
        const whitelistBeforeAdd = await locker.getAllWhitelistedTokens();

        await locker.addTokenInWhitelist(token1Address, {from: deployer});
        const whitelistAfterAdd = await locker.getAllWhitelistedTokens();
        const sizeBefore = whitelistBeforeAdd.length;
        const sizeAfter = whitelistAfterAdd.length;
        expect(await locker.isTokenInWhitelist(token1Address)).true;
        expect(sizeAfter - sizeBefore).equal(1);
        const index = await locker.getIndexOfTokenInWhitelist(token1Address);
        const gettedToken = await locker.getAllWhitelistedTokens();
        expect(gettedToken[index.toNumber() - 1]).equal(token1Address);

        //Unwhitelisting
        const whitelistBeforeRemove = await locker.getAllWhitelistedTokens();

        await locker.removeTokenFromWhitelist(token1Address, {from: deployer});
        const whitelistAfterRemove = await locker.getAllWhitelistedTokens();
        const sizeBeforeRemove = whitelistBeforeRemove.length;
        const sizeAfterRemove = whitelistAfterRemove.length;
        expect(await locker.isTokenInWhitelist(token1Address)).false;
        expect(sizeBeforeRemove - sizeAfterRemove).equal(1);
        const index2 = await locker.getIndexOfTokenInWhitelist(token1Address);
        expect(index2).bignumber.equal(new BN(0));
    });

    it("is lock creating", async () => {
        await locker.setMinDaysLock(0);

        const unlockTime = new BN(timestamp + 10);
        
        await locker.addTokenInWhitelist(token1Address, {from: deployer});
        await token1.transfer(withdrawer, lockAmount.mul(TWO), { from: deployer });
        await token1.approve(lockerAddress, lockAmount.mul(TWO), { from: withdrawer });

        await locker.lockTokens(token1Address, lockAmount, unlockTime, false, { from: withdrawer });

        const lockIds1 = await locker.getDepositsByWithdrawalAddress.call(withdrawer);
        const lockItem1 = await locker.lockedToken(lockIds1[0]);
        expect(lockItem1.tokenAddress).equal(token1Address);
        expect(lockItem1.withdrawalAddress).equal(withdrawer);
        expect(lockItem1.unlockTime).bignumber.equal(unlockTime);

        await locker.lockTokens(token1Address, lockAmount, unlockTime, true, { from: withdrawer, value: ONE_BNB });

        const lockIds2 = await locker.getDepositsByWithdrawalAddress.call(withdrawer);
        const lockItem2 = await locker.lockedToken(lockIds2[1]);
        expect(lockItem2.tokenAddress).equal(token1Address);
        expect(lockItem2.withdrawalAddress).equal(withdrawer);
        expect(lockItem2.unlockTime).bignumber.equal(unlockTime);
    });

    it("is impossible send more bnb then fee", async () => {
        await locker.setMinDaysLock(0);
        const unlockTime = new BN(timestamp + 10);
        
        await locker.addTokenInWhitelist(token1Address, {from: deployer});
        await token1.transfer(withdrawer, lockAmount.mul(TWO), { from: deployer });
        await token1.approve(lockerAddress, lockAmount.mul(TWO), { from: withdrawer });

        // await locker.lockTokens(token1Address, lockAmount, unlockTime, false, { from: withdrawer });

        // const lockIds1 = await locker.getDepositsByWithdrawalAddress.call(withdrawer);
        // const lockItem1 = await locker.lockedToken(lockIds1[0]);
        // expect(lockItem1.tokenAddress).equal(token1Address);
        // expect(lockItem1.withdrawalAddress).equal(withdrawer);
        // expect(lockItem1.unlockTime).bignumber.equal(unlockTime);
        await expectRevert(
            locker.lockTokens(token1Address, lockAmount, unlockTime, true, { from: withdrawer, value: ONE_BNB.add(FOUR) }),
            "TRANSFERED BNB SHOULD BE EQUAL TO FEE SIZE"
        );
    });

});