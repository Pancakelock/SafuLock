import Web3 from 'web3';

export abstract class WalletProvider {
  protected web3: Web3;

  // protected chainInUseId = '0x61';
  protected chainInUseId = '0x38';

  // protected chainInUseName = 'BSC-Testnet';
  protected chainInUseName = 'BSC';

  protected constructor() {
    this.web3 = new Web3();
  }

  public getWeb3(): Web3 {
    return this.web3;
  }

  public abstract getAddress(): Promise<string>;
}
