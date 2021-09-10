import React from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';

import rootStore from '../../../store';
import { WalletProviderName } from '../../../types';

import { WalletProviderService } from './wallet-provider/WalletProviderService';

interface IWalletConnector {
  wallet: WalletProviderService;
  connect: (providerName: WalletProviderName) => Promise<void>;
  disconnect: () => void;
}

const walletProviderService = new WalletProviderService();

export const walletConnectorContext = React.createContext<IWalletConnector>({
  wallet: walletProviderService,
  connect: async (): Promise<void> => {},
  disconnect: (): void => {},
});

@observer
class WalletConnector extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      wallet: walletProviderService,
    };

    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  componentDidMount() {
    const cachedWalletProvider = localStorage.getItem('walletprovider') as WalletProviderName;
    if (cachedWalletProvider) {
      if (cachedWalletProvider === 'metamask') {
        this.connect('metamask').catch((err) => {
          console.debug(err);
        });
      } else if (cachedWalletProvider === 'walletconnect') {
        const walletConnectInfo = JSON.parse(localStorage.getItem('walletconnect') as string);
        if (walletConnectInfo?.connected) {
          this.connect('walletconnect').catch((err) => {
            console.debug(err);
          });
        }
      }
    }

    this.state.wallet.onChainChange$.subscribe(() => {
      this.disconnect();
    });

    this.state.wallet.onAddressChange$.subscribe((address: string) => {
      rootStore.user.setAddress(address);
    });
  }

  connect = async (providerName: WalletProviderName): Promise<void> => {
    try {
      this.state.wallet.connect(providerName);
      localStorage.setItem('walletprovider', providerName);

      const address = await this.state.wallet.getAddress();
      rootStore.user.setAddress(address);
    } catch (err) {
      this.disconnect();
      throw err;
    }
  };

  disconnect = () => {
    localStorage.removeItem('walletprovider');
    this.state.wallet.disconnect();
    rootStore.user.disconnect();
  };

  render() {
    return (
      <walletConnectorContext.Provider
        value={{
          wallet: this.state.wallet,
          connect: this.connect,
          disconnect: this.disconnect,
        }}
      >
        {this.props.children}
      </walletConnectorContext.Provider>
    );
  }
}

export default withRouter(WalletConnector);

export function useWalletConnectorContext(): IWalletConnector {
  return React.useContext(walletConnectorContext);
}
