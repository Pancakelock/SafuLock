import BigNumber from 'bignumber.js/bignumber';

export interface ILock {
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
  unlockDate: Date;
  withdrawn: boolean;
}
