import React from 'react';
import { RadioChangeEvent } from 'antd';

import 'antd/lib/radio/style/css';
import 'antd/lib/button/style/css';

import Close from '../../../assets/img/close.svg';
import MetaMask from '../../../assets/img/metamask.svg';
import WalletConnect from '../../../assets/img/walletconnect.svg';
import { useWalletConnectorContext } from '../../../services/blockchain/wallets/WalletConnector';
import { IConnectWlProps } from '../../../types';
import { Button, RadioGroup } from '../../atoms';

import './ConnectWallet.scss';

const ConnectWallet: React.FC<IConnectWlProps> = ({ onChangeWalletModalHandl }) => {
  const { connect } = useWalletConnectorContext();

  const [value, setValue] = React.useState<number>();
  const [error, setError] = React.useState<string>();

  const onCloseModal = () => {
    onChangeWalletModalHandl(false);
  };

  const onSelectWallet = (event: RadioChangeEvent) => {
    const walletValue = event.target.value;
    const walletProviderName = walletValue === 1 ? 'metamask' : 'walletconnect';

    connect(walletProviderName)
      .then(() => {
        setValue(walletValue);
        setTimeout(() => {
          onChangeWalletModalHandl(false);
        }, 200);
      })
      .catch((err) => {
        setValue(0);
        setError(err.message);
      });
  };

  const box1 = (
    <div className="card-wallet_body_box1">
      <img src={MetaMask} alt="logo" />
      <span className="h2 text-yellow text-bold text-left">MetaMask</span>
    </div>
  );
  const box2 = (
    <div className="card-wallet_body_box2">
      <img src={WalletConnect} alt="logo" />
      <span className="h2 text-yellow text-bold text-left">WalletConnect</span>
    </div>
  );

  const boxes = [
    {
      text: box1,
      value: 1,
    },
    {
      text: box2,
      value: 2,
    },
  ];

  return (
    <>
      <div className="card_overlay" onClick={onCloseModal} role="presentation" />
      <div className="card-wallet">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="card-wallet_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">Select Wallet</span>
          <span className="h2 text-white-black text-bold text-center">Connect to a wallet</span>
        </div>
        <div className="card-wallet_body">
          {error ? <div className="card-wallet_body_error">{error}</div> : null}
          <RadioGroup
            items={boxes}
            onChange={onSelectWallet}
            className="card-wallet_body_btns"
            value={value}
          />
        </div>
      </div>
    </>
  );
};

export default ConnectWallet;
