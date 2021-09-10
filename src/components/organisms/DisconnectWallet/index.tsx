import React from 'react';

import 'antd/lib/radio/style/css';
import 'antd/lib/button/style/css';

import Close from '../../../assets/img/close.svg';
import OutDark from '../../../assets/img/disconnect-dark-theme.svg';
import Out from '../../../assets/img/disconnect.svg';
import { useWalletConnectorContext } from '../../../services/blockchain/wallets/WalletConnector';
import { useMst } from '../../../store';
import { IConnectWlProps } from '../../../types';
import { Button } from '../../atoms';

import './DisconnectWallet.scss';

const DisconnectWallet: React.FC<IConnectWlProps> = ({ onChangeWalletModalHandl, darkTheme }) => {
  const { disconnect } = useWalletConnectorContext();
  const { user } = useMst();

  const onCloseModal = () => {
    onChangeWalletModalHandl(false);
  };

  const onCopyAddressHandl = () => {
    navigator.clipboard.writeText(user.address);
  };

  const onDisconnectWalletHandl = () => {
    disconnect();
    onCloseModal();
  };

  return (
    <>
      <div className="card_overlay" onClick={onCloseModal} role="presentation" />
      <div className="card-wallet-out">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="card-wallet-out_title box-c-c">
          <span className="h1 text-bold text-center text-yellow">Your wallet</span>
          <span className="h2 text-white-black text-bold text-center">
            <span>
              {user.address.substr(0, 8)}...{user.address.substr(user.address.length - 6, 6)}
            </span>
            <Button
              type="button"
              colorScheme="none"
              size="img"
              onClick={onCopyAddressHandl}
              className="card-wallet-out_title-btn_copy"
            >
              Copy
            </Button>
          </span>
        </div>
        <div className="card-wallet-out_body">
          <div className="card-wallet-out_body-btn">
            <Button
              type="submit"
              colorScheme="none"
              size="primary"
              icon={darkTheme ? OutDark : Out}
              className="card-wallet-out_body-btn_disconnect"
              onClick={onDisconnectWalletHandl}
            >
              Discconnect
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DisconnectWallet;
