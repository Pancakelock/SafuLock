import React from 'react';

import Close from '../../../assets/img/close.svg';
import { IEnterAddressProps } from '../../../types';
import { Button } from '../../atoms';
import { AuthForm } from '../../molecules';

import './EnterAddress.scss';

const EnterAddress: React.FC<IEnterAddressProps> = ({ handleChangeOpen, handleShowNext }) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  return (
    <>
      <div className="auth_overlay" onClick={onCloseModal} role="presentation" />
      <div className="auth">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="auth_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">Enter Address</span>
          <span className="h2 text-white text-bold text-center">
            Enter the PancakeLockSwap pair address you’d like to lock liquidity for
          </span>
        </div>
        <div className="auth_body">
          <AuthForm handleChangeOpen={handleChangeOpen} handleShowNext={handleShowNext} />
        </div>
      </div>
    </>
  );
};

export default EnterAddress;
