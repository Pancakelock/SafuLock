import { Subject } from 'rxjs';
import Web3 from 'web3';

import { WalletProvider } from '../WalletProvider';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class MetamaskProvider extends WalletProvider {
  private readonly wallet;

  private currentAddress = '';

  constructor(onChainChange$: Subject<void>, onAddressChange$: Subject<string>) {
    super();

    this.wallet = window.ethereum;
    if (!this.wallet) {
      throw new Error('Please, make sure that metamask is installed');
    }
    this.web3 = new Web3(this.wallet);

    this.wallet.on('chainChanged', () => {
      onChainChange$.next();
    });

    this.wallet.on('accountsChanged', (accounts: string[]) => {
      onAddressChange$.next(accounts[0]);
    });
  }

  public async getAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Please, make sure that metamask is installed');
    }

    const chainId = await this.wallet.request({ method: 'eth_chainId' });
    if (chainId !== this.chainInUseId) {
      throw Error(`Please choose ${this.chainInUseName} network in your wallet`);
    }

    [this.currentAddress] = await this.wallet
      .request({ method: 'eth_requestAccounts' })
      .catch(() => {
        throw new Error('Not authorized.');
      });

    return this.currentAddress;
  }
}
