const { expect } = require("chai");

const Locker = artifacts.require('PancakelockLocker');
const Token = artifacts.require('PancakelockToken');

const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');

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
        const unlockTime = new BN(timestamp + 10);
        
        await locker.addTokenInWhitelist(token1Address, {from: deployer});
        await token1.transfer(withdrawer, lockAmount, { from: deployer });
        await token1.approve(lockerAddress, lockAmount, { from: withdrawer });

        await locker.lockTokens(token1Address, lockAmount, unlockTime, false, { from: withdrawer });

        const lockIds = await locker.getDepositsByWithdrawalAddress.call(withdrawer);
        const lockItem = await locker.lockedToken(lockIds[0]);
        expect(lockItem.tokenAddress).equal(token1Address);
        expect(lockItem.withdrawalAddress).equal(withdrawer);
        expect(lockItem.unlockTime).bignumber.equal(unlockTime);
    });

});