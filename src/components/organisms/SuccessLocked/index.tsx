import React from 'react';
import moment from 'moment';

import 'antd/lib/button/style/css';

import Arrow from '../../../assets/img/arrow-right.svg';
import Close from '../../../assets/img/close.svg';
import Out from '../../../assets/img/out.svg';
import { IModalProps } from '../../../types';
import { Button } from '../../atoms';
import { ITokenName } from '../../sections/Configure/Tokens';
import FieldValue from '../../sections/SuccessLocked';

import './SuccessLock.scss';

interface ISuccessLock extends IModalProps {
  date: Date;
  lockedAmount: number;
  tokenName: ITokenName;
  transactionId: string;
  depositId: number;
  handlChangeTokenAmount: (params: number) => void;
}

const SuccessLock: React.FC<ISuccessLock> = ({
  handleChangeOpen,
  date,
  lockedAmount,
  tokenName,
  transactionId,
  depositId,
  handlChangeTokenAmount,
}) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  const hrefOnExplorer = (
    <a href={`https://testnet.bscscan.com/tx/${transactionId}`} target="_blank" rel="noreferrer">
      <img src={Out} alt="out" />
      {transactionId}
    </a>
  );
  React.useEffect(() => {
    return () => {
      handlChangeTokenAmount(0);
    };
  }, [handlChangeTokenAmount]);

  return (
    <>
      <div className="success_overlay" onClick={onCloseModal} role="presentation" />
      <div className="success">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="success_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">Success</span>
          <span className="h2 text-white text-bold text-center">
            Tokens are successfully locked!
          </span>
        </div>
        <div className="success_body">
          <div className="success_body_locked">
            <FieldValue
              title="You locked"
              text={tokenName.name}
              value={+lockedAmount}
              bold
              color="yellow"
              className="success_body_locked_mr"
            />
            <FieldValue
              title="Until"
              value={moment(date).format('DD.MM.YYYY').toString()}
              className="success_body_locked_until"
            />
          </div>
          <FieldValue title="Transaction id: " value={hrefOnExplorer} />
          <FieldValue
            title="Deposit  ID:"
            value={depositId.toString()}
            className="success_body_depos"
          />
          <div className="success_body_btn">
            <Button
              type="button"
              size="primary"
              colorScheme="yellow"
              icon={Arrow}
              link="/"
              className="success_body_btn-home"
            >
              Back to the Home Page
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessLock;
