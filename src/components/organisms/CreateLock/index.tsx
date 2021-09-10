import React from 'react';
import { RadioChangeEvent } from 'antd';

import 'antd/lib/radio/style/css';
import 'antd/lib/button/style/css';

import ArrowGray from '../../../assets/img/arrow-gray.svg';
import Arrow from '../../../assets/img/arrow-right.svg';
import Close from '../../../assets/img/close.svg';
import LockDark from '../../../assets/img/lock-dark-modal.svg';
import LockWhite from '../../../assets/img/lock-white-modal.svg';
import { ICreateLkProps } from '../../../types';
import { Button, RadioGroup } from '../../atoms';

import './CreateLock.scss';

const CreateLock: React.FC<ICreateLkProps> = ({ handleChangeOpen, handleShowNext }) => {
  const [value, setValue] = React.useState<number>();
  const [disabled, setDisabled] = React.useState(true);

  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  const nextModalHandler = () => {
    handleChangeOpen(false);
    if (value === 2) {
      handleShowNext(true);
    }
  };

  const onSelectToken = (event: RadioChangeEvent) => {
    setValue(event.target.value);
    setDisabled(false);
  };

  const onCheckToggleHandl = () => {
    const theme = document.body.id;
    let found = false;
    if (theme === 'dark') {
      found = true;
    }
    return found;
  };

  const box1 = (
    <div className="card-lock_body_box1 box-r-sb">
      <div className="card-lock_body_box1-left box-c-l">
        <span className="h2 text-yellow text-bold text-left">Liquidity Tokens</span>
        <span className="h3 text-gray text-left">
          CAKE-V2 LP Tokens generated from Pancakeswap Pool
        </span>
      </div>
      <div className="card-lock_body_box1-right box-c-c">
        <img src={onCheckToggleHandl() ? LockWhite : LockDark} alt="lock" />
      </div>
    </div>
  );
  const box2 = (
    <div className="card-lock_body_box2 box-r-sb">
      <div className="card-lock_body_box2-left box-c-l">
        <span className="h2 text-yellow text-bold text-left">Project Tokens</span>
        <span className="h3 text-gray text-left">Regular BEP-20 Project Tokens</span>
      </div>
      <div className="card-lock_body_box2-right box-c-c">
        <img src={onCheckToggleHandl() ? LockWhite : LockDark} alt="lock" />
      </div>
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
      <div className="card-lock">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="card-lock_title box-c-c">
          <span className="h1 text-yellow text-bold text-center">Create New Lock</span>
          <span className="h3 text-white text-bold text-center">
            Select the type token you would like to create a lock for. You can create multiple locks
            with different setting for each one
          </span>
        </div>
        <div className="card-lock_body">
          <RadioGroup
            items={boxes}
            onChange={onSelectToken}
            className="card-lock_body_btns"
            value={value}
          />
          <div className="card-lock_body_btn-cont box-c-c">
            <Button
              type="button"
              size="primary"
              colorScheme="yellow"
              icon={disabled ? ArrowGray : Arrow}
              disabled={disabled}
              link={`/${value === 1 ? 'configure' : ''}`}
              onClick={nextModalHandler}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateLock;
