import React from 'react';
import { valueType } from 'antd/es/statistic/utils';
import { observer } from 'mobx-react-lite';
import moment from 'moment';

import 'antd/lib/radio/style/css';

import ArrowGray from '../../assets/img/arrow-gray.svg';
import ArrowBlack from '../../assets/img/arrow-right.svg';
import Lock from '../../assets/img/lock.svg';
import { Button } from '../../components/atoms';
import { RadioFee } from '../../components/molecules';
import {
  ConnectWallet,
  LackOfTokens,
  Success,
  WalletError,
} from '../../components/organisms/index';
import { Days, Tokens } from '../../components/sections/Configure/index';
import { LockerContract } from '../../services/blockchain/contracts';
import { useWalletConnectorContext } from '../../services/blockchain/wallets/WalletConnector';
import { Web3Public } from '../../services/blockchain/web3/web3-public';
import { useMst } from '../../store';
import { IToken } from '../../types';

import './Configure.scss';

const onGetDateHandl = (add = 7, option = 'Days') => {
  const now = new Date();
  if (option === 'Days') {
    now.setDate(now.getDate() + add);
  } else if (option === 'Months') {
    now.setMonth(now.getMonth() + add);
  } else if (option === 'Years') {
    now.setMonth(now.getFullYear() + add);
  }
  return now;
};

const Configure: React.FC = observer(() => {
  const [tokenAmount, setTokenAmount] = React.useState<valueType>(0);
  const [token, setToken] = React.useState<IToken>();
  const [date, setDate] = React.useState<any>(onGetDateHandl());
  const [feeInBnb, setFeeInBnb] = React.useState<boolean>(true);
  const [transactionId, setTransactionId] = React.useState<string>('');
  const [depositId, setDepositId] = React.useState<number>(0);
  const [usersBalance, setUsersBalance] = React.useState<string>('0');

  const [isApproved, setIsApproved] = React.useState(false);
  const [isInProgress, setIsInProgress] = React.useState(true);
  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [isSuccess, setOpenSuccess] = React.useState(false);
  const [isLackTokens, setOpenLackModal] = React.useState(false);
  const [isErrorWallet, setOpenErrorWallet] = React.useState(false);

  const { user } = useMst();
  const { wallet } = useWalletConnectorContext();

  const onSetNewDateHandl = (unlockDay: number, value: string) => {
    setDate(onGetDateHandl(unlockDay, value));
  };

  const onApprove = () => {
    if (!wallet.isConnected()) {
      setIsWalletOpen(true);
    } else {
      setIsInProgress(true);
      const lockerContract = new LockerContract(wallet.getWalletProvider());
      lockerContract
        .approve(
          {
            address: (token as IToken).address,
            decimals: (token as IToken).decimals,
          },
          tokenAmount,
        )
        .then(() => {
          setIsApproved(true);
        })
        .catch((err) => {
          console.debug(err);
        })
        .finally(() => {
          setIsInProgress(false);
        });
    }
  };

  const onLockTokens = () => {
    if (!wallet.isConnected()) {
      setIsWalletOpen(true);
    } else if (+usersBalance >= +tokenAmount) {
      setIsInProgress(true);
      const lockerContract = new LockerContract(wallet.getWalletProvider());
      lockerContract
        .lockTokens(
          {
            address: (token as IToken).address,
            decimals: (token as IToken).decimals,
          },
          +tokenAmount,
          new Date(date.getTime() + 60000 * 300),
          feeInBnb,
        )
        .then((receipt) => {
          setTransactionId(receipt.transactionHash);
          setDepositId(receipt.events?.TokensLocked.returnValues[4]);
          setOpenSuccess(true);
        })
        .catch((err) => {
          setOpenErrorWallet(true);
          console.debug(err);
        })
        .finally(() => {
          setIsInProgress(false);
        });
    } else setOpenLackModal(true);
  };

  React.useEffect(() => {
    setIsApproved(false);
    if (token) {
      setIsInProgress(false);
    }
    if (user.address && token) {
      const web3Public = new Web3Public();
      web3Public
        .getBalanceOf((token as IToken).address, user.address)
        .then((res) => {
          const balance = Web3Public.fromWei(res, (token as IToken).decimals).toFixed();
          setUsersBalance(balance);
        })
        .catch((err) => {
          setUsersBalance('0');
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  }, [user.address, token]);

  return (
    <div className="configure box-c-c">
      {isWalletOpen ? <ConnectWallet onChangeWalletModalHandl={setIsWalletOpen} /> : null}
      {isSuccess ? (
        <Success
          date={date}
          lockedAmount={+tokenAmount}
          handlChangeTokenAmount={setTokenAmount}
          tokenName={{ name: token?.name as string, symbol: token?.symbol as string }}
          transactionId={transactionId}
          depositId={depositId}
          handleChangeOpen={setOpenSuccess}
        />
      ) : null}
      {isLackTokens ? <LackOfTokens handleChangeOpen={setOpenLackModal} /> : null}
      {isErrorWallet ? <WalletError handleChangeOpen={setOpenErrorWallet} /> : null}

      <div className="configure_title box-r-sb">
        <img src={Lock} alt="lock" />
        <span className="text-white-black text-bold">Configure Lock</span>
      </div>
      <span className="h4 text-gray-const text-upper text-left">Lock tokens amount</span>
      <div className="configure_boxes">
        <Tokens
          type="configure"
          tokenAmount={tokenAmount}
          onChangeAmountDataHandl={setTokenAmount}
          onSetToken={setToken}
          usersBalance={usersBalance}
        />
        <Days
          onSetNewDateHandl={onSetNewDateHandl}
          date={moment(date).format('DD.MM.YYYY').toString()}
        />
      </div>
      <div className="configure_radio-box">
        <RadioFee setFeeInBnb={setFeeInBnb} />
      </div>
      <div className="configure_btns box-c-c">
        <Button
          type="button"
          disabled={isApproved || tokenAmount === 0}
          loading={!isApproved && isInProgress}
          size="primary"
          icon={!isApproved ? ArrowBlack : ArrowGray}
          className="configure_btns_btn"
          onClick={onApprove}
        >
          Approve
        </Button>
        <br />
        <Button
          type="button"
          disabled={!isApproved || tokenAmount === 0}
          loading={isApproved && isInProgress}
          size="primary"
          colorScheme="yellow"
          icon={isApproved ? ArrowBlack : ArrowGray}
          className="configure_btns_btn"
          onClick={onLockTokens}
        >
          Lock Tokens
        </Button>
      </div>
    </div>
  );
});

export default Configure;
