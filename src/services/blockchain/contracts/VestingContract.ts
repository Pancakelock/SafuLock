import BigNumber from 'bignumber.js/bignumber';
import { TransactionReceipt } from 'web3-eth';

import { WalletProvider } from '../wallets/wallet-provider/WalletProvider';
import { Web3Private } from '../web3/web3-private';
import { Web3Public } from '../web3/web3-public';

import { vestingAbi } from './abi/vestingAbi';

export interface IVesting {
  id: number;
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  withdrawalAddress: string;
  amount: BigNumber;
  lockDate: Date;
  maxUnlockDate: Date;
  unlockDates: Date[];
  percents: number[];
}

export class VestingContract {
  private static readonly contractAddress = '0x54244aE884eb007b01891e91CA33607D7B838A41';
  // private static readonly contractAddress = '0xaDA83e0655835F2eea69Cc87B7B88eA7Bb7aEF54';
  // private static readonly contractAddress = '0xD8efBc8d254A085fb26f25b591B227D7C4643518';

  private static readonly contractAbi = vestingAbi;

  private readonly web3Public: Web3Public;

  private readonly web3Private: Web3Private | undefined;

  constructor(private readonly walletProvider: WalletProvider | undefined) {
    this.web3Public = new Web3Public();
    if (walletProvider) {
      this.web3Private = new Web3Private(walletProvider);
    }
  }

  public approve(
    token: { address: string; decimals: number },
    amount: string | number,
  ): Promise<void> {
    if (!this.web3Private) {
      throw Error('Wallet is not connected');
    }

    return this.web3Private.approveToken(
      token,
      VestingContract.contractAddress,
      amount,
      'infinity',
    );
  }

  public async vestTokens(
    token: { address: string; decimals: number },
    amount: number,
    percents: number[],
    unlockDates: Date[],
    feeInBnb: boolean,
  ): Promise<TransactionReceipt> {
    if (!this.walletProvider || !this.web3Private) {
      throw Error('Wallet is not connected');
    }

    const amountAbsolute = Web3Public.toWei(amount, token.decimals).toFixed(0);
    const modifiedPercents = percents.map((percent) => percent * 10);
    const modifiedUnlockDates = unlockDates.map((unlockDate) =>
      Math.floor(unlockDate.getTime() / 1000),
    );
    const userAddress = await this.walletProvider.getAddress();

    const value = feeInBnb ? Web3Public.toWei(1).toFixed() : '0';
    return this.web3Private.executeContractMethod(
      VestingContract.contractAddress,
      VestingContract.contractAbi,
      'vestTokens',
      [token.address, amountAbsolute, modifiedPercents, modifiedUnlockDates, userAddress, feeInBnb],
      value,
    );
  }

  private async getVestingByVestingInfo(
    vest: (string | string[])[],
    id: number,
  ): Promise<IVesting> {
    const tokenAddress = vest[0] as string;
    const tokenInfo = await this.web3Public.getTokenInfo(tokenAddress, [
      'name',
      'symbol',
      'decimals',
    ]);
    const unlockDates = (vest[6] as string[]).map((date) => new Date(+date * 1000));
    const maxUnlockDate = (vest[6] as string[]).map((date) => +date).sort()[vest[6].length - 1];
    const percents = (vest[4] as string[]).map((percent) => +percent / 10000);
    return {
      id,
      token: {
        address: tokenAddress,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
      },
      withdrawalAddress: vest[1] as string,
      amount: Web3Public.fromWei(vest[3] as string, tokenInfo.decimals),
      lockDate: new Date(+vest[5] * 1000),
      maxUnlockDate: new Date(maxUnlockDate * 1000),
      unlockDates,
      percents,
    };
  }

  public async getAllVestings(): Promise<IVesting[]> {
    const lastVestId: number = parseInt(
      await this.web3Public.callContractMethod(
        VestingContract.contractAddress,
        VestingContract.contractAbi,
        'getLastId',
      ),
      10,
    );
    const allVestsIds = [...Array.from(Array(lastVestId).keys())];
    const allVestsPromises = allVestsIds.map((id) =>
      this.web3Public.callContractMethod(
        VestingContract.contractAddress,
        VestingContract.contractAbi,
        'getVestingInfo',
        [id],
      ),
    );
    const allVests = await Promise.all(allVestsPromises);
    const userVestsPromises = allVests
      .map((vest, id) => ({ vest, id }))
      .map(({ vest, id }) => this.getVestingByVestingInfo(vest, id))
      .reverse();
    return Promise.all(userVestsPromises);
  }

  public async getVestingById(id: number): Promise<IVesting> {
    const vest = await this.web3Public.callContractMethod(
      VestingContract.contractAddress,
      VestingContract.contractAbi,
      'getVestingInfo',
      [id],
    );
    return this.getVestingByVestingInfo(vest, id);
  }

  public async withdraw(vestingId: number, index: number): Promise<TransactionReceipt> {
    if (!this.web3Private) {
      throw Error('Wallet is not connected');
    }

    return this.web3Private.executeContractMethod(
      VestingContract.contractAddress,
      VestingContract.contractAbi,
      'withdraw',
      [vestingId, index],
    );
  }
}
