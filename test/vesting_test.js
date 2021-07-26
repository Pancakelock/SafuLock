const { expect } = require("chai");

const Vesting = artifacts.require('PancakelockTokenVesting');
const Token = artifacts.require('PancakelockToken');
const Master = artifacts.require("PancakelockTokenVault");

const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');



const ZERO = new BN(0);
const ONE = new BN(1);
const TWO = new BN(2);
const THREE = new BN(3);
const FOUR = new BN(4);
const FIVE = new BN(5);

const TEN = new BN(10);
const TWENTY = new BN(20);
const THIRTY = new BN(30);
const FOURTY = new BN(40);
const DECIMALS = new BN(18);

const ONE_TOKEN = TEN.pow(DECIMALS);

const vestAmount = ONE_TOKEN;

contract('Vesting', ([deployer, feeReciever, withdrawer, user2]) => {
    let vesting, token, master;
    let vestingAddress, tokenAddress, masterAddress;
    let timestamp, TIMESTAMP;


    beforeEach(async () => {
        token = await Token.new({ from: deployer });
        tokenAddress = await token.address;



        master = await Master.new({ from: deployer });
        masterAddress = await master.address;

        vesting = await Vesting.new(masterAddress, feeReciever, { from: deployer });
        vestingAddress = await vesting.address;

        await token.transfer(withdrawer, vestAmount, { from: deployer });
        await token.approve(vestingAddress, vestAmount, { from: withdrawer });

        const block = await web3.eth.getBlock("latest");
        timestamp = await block['timestamp'];
        TIMESTAMP = new BN(timestamp);
    });

    it('is vesting create correctly', async () => {
        //INIT PARAMS:
        const time0 = TIMESTAMP.add(TEN);
        const time1 = TIMESTAMP.add(TWENTY);
        const time2 = TIMESTAMP.add(THIRTY);
        const time3 = TIMESTAMP.add(FOURTY);
        const times = [time0, time1, time2, time3];
        const percents= [THIRTY.mul(TEN), THIRTY.mul(TEN), THIRTY.mul(TEN), TEN.mul(TEN)];

        const incorrectTimes = [TIMESTAMP.sub(TEN), TIMESTAMP.sub(THIRTY), TIMESTAMP.sub(FOURTY), TIMESTAMP.sub(TWENTY)]
        const incorrectPercents = [THIRTY, THIRTY, THIRTY, THIRTY]
        //TEST CORRECT PRAMS:
        await vesting.vestTokens(tokenAddress, vestAmount, percents, times, withdrawer, false, { from: withdrawer });
        const vestId = await vesting.userVestingAt(withdrawer, ZERO);
        const vestingItem = await vesting.getVestingInfo(vestId);
        expect(vestingItem.token).equal(tokenAddress);
        expect(vestingItem.owner).equal(withdrawer);
        expect(vestingItem.unlockTimes[0]).bignumber.equal(time0);
        expect(vestingItem.unlockTimes[3]).bignumber.equal(time3);

        const numOfVestings = await vesting.getNumOfUsersVestings(withdrawer);
        expect(numOfVestings).bignumber.equal(ONE);
    });
    it('is withdraw correct', async () => {
        const time0 = TIMESTAMP.add(TEN);
        const time1 = TIMESTAMP.add(TEN.add(ONE));
        const time2 = TIMESTAMP.add(TEN.add(TWO));
        const time3 = TIMESTAMP.add(TEN.add(THREE));
        const times = [time0, time1, time2, time3];
        const percents= [THIRTY.mul(TEN), THIRTY.mul(TEN), THIRTY.mul(TEN), TEN.mul(TEN)];

        const incorrectTimes = [TIMESTAMP.sub(TEN), TIMESTAMP.sub(THIRTY), TIMESTAMP.sub(FOURTY), TIMESTAMP.sub(TWENTY)]
        const incorrectPercents = [THIRTY, THIRTY, THIRTY, THIRTY]
        //TEST CORRECT PRAMS:
        await vesting.vestTokens(tokenAddress, vestAmount, percents, times, withdrawer, false, { from: withdrawer });
        const vestId = await vesting.userVestingAt(withdrawer, ZERO);
        setTimeout(async () => {
            await vesting.withdraw(vestId, ZERO, { from: withdrawer });
            const vestingItem = await vesting.getVestingInfo(vestId);
            const instance = vestingItem.inctance;
            const withdrawnSum = vestAmount * percents[0] / 1000;
            expect(vestingItem.percents[0]).bignumber.eq(ZERO);
            const currentBalance = await token.balanceOf(instance);
            expect(currentBalance.add(new BN(withdrawnSum))).bignumber.eq(vestAmount);
        }, 11)
    });

});