import React from 'react';

import Arrow from '../../../assets/img/arrow-right.svg';
import Close from '../../../assets/img/close.svg';
import Info from '../../../assets/img/info-modal.svg';
import { IModalProps } from '../../../types';
import { Button } from '../../atoms';

import './NotEnaughPerc.scss';

interface INotEnaughtPerc extends IModalProps {
  value: number;
}

const NotEnaughPerc: React.FC<INotEnaughtPerc> = ({ handleChangeOpen, value }) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  return (
    <>
      <div className="metamaskError_overlay" onClick={onCloseModal} role="presentation" />
      <div className="metamaskError">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="metamaskError_title box-c-c">
          {/* <span className="h1 text-yellow text-bold text-center">Error</span> */}
          <img src={Info} alt="info" />
          <span className="h2 text-white-black text-bold text-center">
            You have {value}% of the tokens left. You can create a new lock or reduce the initial
            amount
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

export default NotEnaughPerc;
