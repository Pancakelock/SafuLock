import WalletConnect from '@walletconnect/web3-provider';
import { Subject } from 'rxjs';
import Web3 from 'web3';

import { WalletProvider } from '../WalletProvider';

export class WalletConnectProvider extends WalletProvider {
  private readonly wallet;

  private currentAddress = '';

  constructor(onChainChange$: Subject<void>, onAddressChange$: Subject<string>) {
    super();

    this.wallet = new WalletConnect({
      infuraId: '201bc1a93257493bbfa2f87a456f25cf',
      rpc: {
        42: 'https://kovan.infura.io/v3/201bc1a93257493bbfa2f87a456f25cf',
        56: 'https://bsc-dataseed.binance.org/',
      },
      bridge: 'https://bridge.walletconnect.org',
    });
    this.web3 = new Web3(this.wallet as any);

    this.wallet.on('chainChanged', () => {
      onChainChange$.next();
    });

    this.wallet.on('accountsChanged', (accounts: string[]) => {
      onAddressChange$.next(accounts[0]);
    });
  }

  public async getAddress(): Promise<string> {
    [this.currentAddress] = await this.wallet.enable();

    const { chainId } = this.wallet;
    if (chainId !== parseInt(this.chainInUseId, 16)) {
      this.wallet.disconnect();
      throw Error(`Please choose ${this.chainInUseName} network in your wallet`);
    }

    return this.currentAddress;
  }
}
