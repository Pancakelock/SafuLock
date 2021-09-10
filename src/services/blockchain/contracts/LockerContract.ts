import { TransactionReceipt } from 'web3-eth';

import { ILPToken, IToken } from '../../../types';
import { WalletProvider } from '../wallets/wallet-provider/WalletProvider';
import { Web3Private } from '../web3/web3-private';
import { Web3Public } from '../web3/web3-public';

import { lockerAbi } from './abi/lockerAbi';
import { ILock } from './types/ILock';

export class LockerContract {
  private static readonly contractAddress = '0xF567103b57a457F03170Ffcea26F0845a6b7c265';
  // private static readonly contractAddress = '0xE417064135Eb9B2BFF86D06E6061270FBed01b07';
  // private static readonly contractAddress = '0x2d181AB28EF75F4a85949bc97ca61CF1dBd2965B';

  private static readonly contractAbi = lockerAbi;

  private readonly web3Public: Web3Public;

  private readonly web3Private: Web3Private | undefined;

  private static whitelistedTokens: (IToken | ILPToken)[] = [];

  constructor(walletProvider: WalletProvider | undefined) {
    this.web3Public = new Web3Public();
    if (walletProvider) {
      this.web3Private = new Web3Private(walletProvider);
    }
  }

  public static isTokenInWhitelist(tokenAddress: string): Promise<boolean> {
    return new Web3Public().callContractMethod(
      LockerContract.contractAddress,
      LockerContract.contractAbi,
      'isTokenInWhitelist',
      [tokenAddress],
    );
  }

  public static async getAllWhitelistedTokens(): Promise<(IToken | ILPToken)[]> {
    if (LockerContract.whitelistedTokens.length) {
      return LockerContract.whitelistedTokens;
    }
    const tokensAddresses = await new Web3Public().callContractMethod(
      LockerContract.contractAddress,
      LockerContract.contractAbi,
      'getAllWhitelistedTokens',
    );
    const tokensPromises = tokensAddresses.map(async (address: string) => {
      try {
        const tokenInfo = await new Web3Public().getTokenInfo(address, [
          'name',
          'symbol',
          'decimals',
        ]);
        let token0;
        let token1;
        try {
          token0 = (await new Web3Public().getTokenInfo(address, ['token0'])).token0;
          token1 = (await new Web3Public().getTokenInfo(address, ['token0'])).token1;
        } catch (err) {
          // nothing
        }
        if (!token0 || !token1) {
          return {
            address,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
          };
        }
        const token0Info = await new Web3Public().getTokenInfo(token0, ['symbol']);
        const token1Info = await new Web3Public().getTokenInfo(token1, ['symbol']);
        return {
          address,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          token0: {
            address: token0,
            symbol: token0Info.symbol,
          },
          token1: {
            address: token1,
            symbol: token1Info.symbol,
          },
        };
      } catch (err) {
        return null;
      }
    });
    LockerContract.whitelistedTokens = (await Promise.all(tokensPromises)).filter(
      (t) => t !== null,
    ) as (IToken | ILPToken)[];
    return LockerContract.whitelistedTokens;
  }

  public approve(
    token: { address: string; decimals: number },
    amount: string | number,
  ): Promise<void> {
    if (!this.web3Private) {
      throw Error('Wallet is not connected');
    }

    return this.web3Private.approveToken(token, LockerContract.contractAddress, amount, 'infinity');
  }

  public lockTokens(
    token: { address: string; decimals: number },
    amount: number,
    unlockDate: Date,
    feeInBnb: boolean,
  ): Promise<TransactionReceipt> {
    if (!this.web3Private) {
      throw Error('Wallet is not connected');
    }
    const amountAbsolute = Web3Public.toWei(amount, token.decimals).toFixed(0);
    const value = feeInBnb ? Web3Public.toWei(1).toFixed() : '0';
    return this.web3Private.executeContractMethod(
      LockerContract.contractAddress,
      LockerContract.contractAbi,
      'lockTokens',
      [token.address, amountAbsolute, Math.floor(unlockDate.getTime() / 1000), feeInBnb],
      value,
    );
  }

  private async getLockByDepositDetails(lock: string[], id: number): Promise<ILock> {
    const tokenAddress = lock[0];
    const tokenInfo = await this.web3Public.getTokenInfo(tokenAddress, [
      'name',
      'symbol',
      'decimals',
    ]);
    return {
      id,
      token: {
        address: tokenAddress,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
      },
      withdrawalAddress: lock[1],
      amount: Web3Public.fromWei(lock[2], tokenInfo.decimals),
      lockDate: new Date(+lock[3] * 1000),
      unlockDate: new Date(+lock[4] * 1000),
      withdrawn: !!lock[5],
    };
  }

  public async getAllLocks(): Promise<ILock[]> {
    const allLocksId: number[] = await this.web3Public.callContractMethod(
      LockerContract.contractAddress,
      LockerContract.contractAbi,
      'getAllDepositIds',
    );
    const allLocksPromises = allLocksId.map((id) =>
      this.web3Public.callContractMethod(
        LockerContract.contractAddress,
        LockerContract.contractAbi,
        'lockedToken',
        [id],
      ),
    );
    const allLocks = await Promise.all(allLocksPromises);
    const userLocksPromises = allLocks
      .map((lock, id) => ({ lock, id }))
      .map(({ lock, id }) => this.getLockByDepositDetails(lock, id))
      .reverse();
    return Promise.all(userLocksPromises);
  }

  public async getLockByDepositId(id: number): Promise<ILock> {
    const lock = await this.web3Public.callContractMethod(
      LockerContract.contractAddress,
      LockerContract.contractAbi,
      'lockedToken',
      [id],
    );
    return this.getLockByDepositDetails(lock, id);
  }

  public async withdrawTokens(id: number): Promise<TransactionReceipt> {
    if (!this.web3Private) {
      throw Error('Wallet is not connected');
    }

    return this.web3Private.executeContractMethod(
      LockerContract.contractAddress,
      LockerContract.contractAbi,
      'withdrawTokens',
      [id],
    );
  }
}
