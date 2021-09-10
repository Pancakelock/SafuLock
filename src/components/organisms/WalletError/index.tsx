import React from 'react';

import Arrow from '../../../assets/img/arrow-right.svg';
import Close from '../../../assets/img/close.svg';
import { IModalProps } from '../../../types';
import { Button } from '../../atoms';

import './WalletError.scss';

const WalletError: React.FC<IModalProps> = ({ handleChangeOpen }) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  return (
    <>
      <div className="metamaskError_overlay" onClick={onCloseModal} role="presentation" />
      <div className="metamaskError">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="metamaskError_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">Error</span>
          <span className="h2 text-white-black text-bold text-center">
            Something went wrong, check your wallet
          </span>
        </div>
        <div className="metamaskError_body">
          <Button
            type="submit"
            size="primary"
            colorScheme="yellow"
            icon={Arrow}
            className="projectNotCertified_btn"
            onClick={() => handleChangeOpen(false)}
          >
            OK
          </Button>
        </div>
      </div>
    </>
  );
};

export default WalletError;
