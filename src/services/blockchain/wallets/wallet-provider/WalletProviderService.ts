import { Subject } from 'rxjs';

import { WalletProviderName } from '../../../../types';

import { MetamaskProvider } from './providers/MetamaskProvider';
import { WalletConnectProvider } from './providers/WalletConnectProvider';
import { WalletProvider } from './WalletProvider';

export class WalletProviderService {
  private walletProvider: WalletProvider | undefined;

  private readonly onChainChange$: Subject<void>;

  private readonly onAddressChange$: Subject<string>;

  constructor() {
    this.onChainChange$ = new Subject();
    this.onAddressChange$ = new Subject();
  }

  public isConnected(): boolean {
    return !!this.walletProvider;
  }

  public connect(providerName: WalletProviderName): void {
    if (providerName === 'metamask') {
      this.walletProvider = new MetamaskProvider(this.onChainChange$, this.onAddressChange$);
    } else if (providerName === 'walletconnect') {
      this.walletProvider = new WalletConnectProvider(this.onChainChange$, this.onAddressChange$);
    } else {
      throw Error('No such provider');
    }
  }

  public disconnect(): void {
    this.walletProvider = undefined;
  }

  public getAddress(): Promise<string> {
    if (!this.walletProvider) {
      throw Error('No wallet connnected');
    }

    return this.walletProvider.getAddress();
  }

  public getWalletProvider(): WalletProvider | undefined {
    return this.walletProvider;
  }
}
