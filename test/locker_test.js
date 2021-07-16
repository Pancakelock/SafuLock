const { expect } = require("chai");

const Locker = artifacts.require('PancakelockLocker');

const Web3 = require("web3");
const web3 = new Web3('http://127.0.0.1:7545');
const { BN } = require('@openzeppelin/test-helpers');

const FIVE = new BN(5);
const TEN = new BN(10);
const DECIMALS = new BN(18);

const ONE_BNB = TEN.pow(DECIMALS);


contract('Locker', accounts => {
    let locker;

    beforeEach(async () => {
        locker = await Locker.new();
    });

    it("is bnb fee equals 1 bnb", async  () => {
        const bnbFee = await locker.bnbFee();
        expect(bnbFee).bignumber.equal(ONE_BNB);
        //assert.equal(new BN(bnbFee), ONE_BNB, "bnb fee isn't 1 bnb");
    });

    it("is token fee equals 0.5%", async  () => {
        const tokenFee = await locker.lpFeePercent();
        expect(tokenFee).bignumber.equal(FIVE);
        //assert.equal(new BN(tokenFee), FIVE, "bnb fee isn't 1 bnb");
    });
});