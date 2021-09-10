import React from 'react';

import Arrow from '../../../assets/img/arrow-right.svg';
import Close from '../../../assets/img/close.svg';
import { IModalProps } from '../../../types';
import { Button } from '../../atoms';

import './LackOfTokens.scss';

const LackOfTokens: React.FC<IModalProps> = ({ handleChangeOpen }) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  return (
    <>
      <div className="lackOfTokens_overlay" onClick={onCloseModal} role="presentation" />
      <div className="lackOfTokens">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="lackOfTokens_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">Error</span>
          <span className="h2 text-white-black text-bold text-center">
            You dont have enough amount of token to lock
          </span>
        </div>
        <div className="lackOfTokens_body">
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

export default LackOfTokens;
