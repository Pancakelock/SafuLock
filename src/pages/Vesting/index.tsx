import React from 'react';
import { valueType } from 'antd/es/statistic/utils';
import { observer } from 'mobx-react-lite';

import ArrowGray from '../../assets/img/arrow-gray.svg';
import ArrowBlack from '../../assets/img/arrow-right.svg';
import { Button } from '../../components/atoms';
import { RadioFee } from '../../components/molecules';
import {
  ConnectWallet,
  LackOfTokens,
  Success,
  WalletError,
} from '../../components/organisms/index';
import NotEnaughPerc from '../../components/organisms/NotEnoughPerc';
import { Tokens } from '../../components/sections/Configure/index';
import { UnlockTable } from '../../components/sections/Vesting/index';
import { VestingContract } from '../../services/blockchain/contracts';
import { useWalletConnectorContext } from '../../services/blockchain/wallets/WalletConnector';
import { Web3Public } from '../../services/blockchain/web3/web3-public';
import { useMst } from '../../store';
import { IToken } from '../../types';

import './Vesting.scss';

export interface ITableData {
  id: number;
  percent: number;
  amount: number;
  date: Date;
}

export interface IgroupInputProps {
  itemId: number;
  percent: number;
  amount: number;
}

const REFRESH_TIME = 1800000;
function onRefreshWindowHandler(time: number) {
  setTimeout(() => {
    window.location.reload();
  }, time);
}
onRefreshWindowHandler(REFRESH_TIME);

const Vesting: React.FC = observer(() => {
  const initialTableData: ITableData[] = [
    {
      id: Math.random(),
      percent: 0,
      amount: 0,
      date: new Date(Date.now() + 60000 * 60 * 24 * 7 + 6000 * 300),
    },
    {
      id: Math.random(),
      percent: 0,
      amount: 0,
      date: new Date(Date.now() + 60000 * 60 * 24 * 7 + 6000 * 300),
    },
  ];

  const [tableData, setTableData] = React.useState<ITableData[]>(initialTableData);
  const [tokenAmount, setTokenAmount] = React.useState<valueType>(0);
  const [token, setToken] = React.useState<IToken>();
  const [feeInBnb, setFeeInBnb] = React.useState<boolean>(true);
  const [transactionId, setTransactionId] = React.useState<string>('');
  const [depositId, setDepositId] = React.useState<number>(0);
  const [usersBalance, setUsersBalance] = React.useState<string>('0');

  const [isValidInput, setValidInput] = React.useState(false);
  const [isApproved, setIsApproved] = React.useState(false);
  const [isInProgress, setIsInProgress] = React.useState(false);
  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [isSuccess, setOpenSuccess] = React.useState(false);
  const [isLackTokens, setOpenLackModal] = React.useState(false);
  const [isErrorWallet, setOpenErrorWallet] = React.useState(false);
  const [isNotEnaugh, setEnaughModal] = React.useState(false);

  const { user } = useMst();
  const { wallet } = useWalletConnectorContext();

  const getChangedTableData = (itemId: number, key: string, value: number | Date) => {
    return tableData.map((tableItem) => {
      if (tableItem.id === itemId) {
        return {
          ...tableItem,
          [key]: value,
        };
      }
      return tableItem;
    });
  };

  const onGetInputSumHandl = (itemId: number, key: 'percent' | 'amount', value: number) => {
    return getChangedTableData(itemId, key, value).reduce((acc, item) => acc + item[key], 0);
  };

  const onSetInputValueHandl = (itemId: number, key: string, value: number) => {
    setTableData(getChangedTableData(itemId, key, value));
  };

  const onSetGroupInputValueHandl = (itemId: number, percent: number, amount: number) => {
    const changedData = tableData.map((tableItem) => {
      if (tableItem.id === itemId) {
        tableItem.percent = percent;
        tableItem.amount = amount;
      }
      return tableItem;
    });

    setTableData(changedData);
  };

  const onSetDateHandl = (itemId: number, key: string, value: Date) => {
    setTableData(getChangedTableData(itemId, key, value));
  };

  const onAddNewItemHandl = () => {
    setTableData((prev) => [
      ...prev,
      {
        id: Math.random(),
        percent: 0,
        amount: 0,
        date: new Date(Date.now() + 60000 * 60 * 24 * 7 + 6000 * 300),
      },
    ]);
  };

  const handlCheckEnaughPerc = () =>
    // eslint-disable-next-line
    100 - tableData.reduce((acc, item) => (acc += item.percent), 0);

  const onDeleteItemHandl = (itemId: number) => {
    if (tableData.length === 1) {
      return;
    }
    setTableData((prev) => prev.filter((item) => item.id !== itemId));
  };

  function getLastDate(): Date {
    const dates = tableData.map((tableItem) => tableItem.date);
    return dates.sort((a, b) => {
      return a.getTime() < b.getTime() ? 1 : -1;
    })[0];
  }

  const onApprove = () => {
    if (!wallet.isConnected()) {
      setIsWalletOpen(true);
    } else if (handlCheckEnaughPerc() !== 0) {
      setEnaughModal(true);
    } else {
      setIsInProgress(true);
      const vestingContract = new VestingContract(wallet.getWalletProvider());
      vestingContract
        .approve(
          {
            address: (token as IToken).address,
            decimals: 18,
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

  const onVestTokens = () => {
    if (!wallet.isConnected()) {
      setIsWalletOpen(true);
    } else if (+usersBalance >= +tokenAmount) {
      setIsInProgress(true);
      const vestingContract = new VestingContract(wallet.getWalletProvider());
      const percents = tableData.map((tableItem) => +tableItem.percent.toFixed(12));
      const dates = tableData.map((tableItem) => tableItem.date);
      vestingContract
        .vestTokens(
          {
            address: '0x3D55e9E7f885F5787A12Aee6CFf5052b04f180FE',
            decimals: 18,
          },
          +tokenAmount,
          percents,
          dates,
          feeInBnb,
        )
        .then((receipt) => {
          setTransactionId(receipt.transactionHash);
          setDepositId(receipt.events?.OnVestingCreate.returnValues[0]);
          setOpenSuccess(true);
          setTableData(initialTableData);
          setIsApproved(false);
          setValidInput(false);
          setIsInProgress(false);
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
    // setIsApproved(false);
    const found = !!tableData.find((item) => item.percent === 0);
    setValidInput(!found);
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
  }, [user.address, token, tableData, isSuccess]);

  return (
    <div className="vesting">
      {isWalletOpen ? <ConnectWallet onChangeWalletModalHandl={setIsWalletOpen} /> : null}
      {isLackTokens ? <LackOfTokens handleChangeOpen={setOpenLackModal} /> : null}
      {isErrorWallet ? <WalletError handleChangeOpen={setOpenErrorWallet} /> : null}
      {isNotEnaugh ? (
        <NotEnaughPerc value={handlCheckEnaughPerc()} handleChangeOpen={setEnaughModal} />
      ) : null}
      {isSuccess ? (
        <Success
          handlChangeTokenAmount={setTokenAmount}
          date={getLastDate()}
          lockedAmount={+tokenAmount}
          tokenName={{ name: token?.name as string, symbol: token?.symbol as string }}
          transactionId={transactionId}
          depositId={depositId}
          handleChangeOpen={setOpenSuccess}
        />
      ) : null}
      <div className="vesting_tokens">
        <span className="text-upper text-gray-const text-left">Lock for vesting amount</span>
        <Tokens
          type="vesting"
          tokenAmount={tokenAmount}
          onChangeAmountDataHandl={setTokenAmount}
          onSetToken={setToken}
          usersBalance={usersBalance}
        />
      </div>
      <h1 className="h24 text-yellow text-bold text-left">Unlocks</h1>
      <div className="vesting_unlocks">
        <div className="vesting_uncloks_table">
          <UnlockTable
            items={tableData}
            isSuccess={isSuccess}
            tokenName={{ name: token?.name as string, symbol: token?.symbol as string }}
            maxUnlockAmount={tokenAmount}
            onSetDateHandl={onSetDateHandl}
            onDeleteItemHandl={onDeleteItemHandl}
            onSetInputValueHandl={onSetInputValueHandl}
            onGetInputSumHandl={onGetInputSumHandl}
            onSetGroupInputValueHandl={onSetGroupInputValueHandl}
          />
        </div>
        <div className="vesting_add">
          <Button
            type="button"
            size="secondary"
            className="vesting_add-btn"
            onClick={onAddNewItemHandl}
          >
            + Add new unlock item
          </Button>
        </div>

        <RadioFee setFeeInBnb={setFeeInBnb} />
        <div className="vesting_text">
          <span className="text-gray-const">
            Once tokens are locked they cannot be withdrawn under any circumstances until the timer
            has expired. Please ensure the parameters are correct, as they are final.
          </span>
        </div>
        <div className="vesting_btns box-c-c">
          <Button
            type="button"
            disabled={isApproved || !isValidInput || tokenAmount === 0}
            loading={!isApproved && isInProgress}
            size="primary"
            icon={!isApproved && isValidInput && tokenAmount !== 0 ? ArrowBlack : ArrowGray}
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
            onClick={onVestTokens}
          >
            Lock Tokens
          </Button>
        </div>
      </div>
    </div>
  );
});

export default Vesting;
