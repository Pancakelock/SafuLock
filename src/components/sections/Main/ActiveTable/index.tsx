import React from 'react';
import BigNumber from 'bignumber.js/bignumber';

import { BIG_NUMBER_FORMAT } from '../../../../constants/BIG_NUMBER_FORMAT';
import { LockerContract, VestingContract } from '../../../../services/blockchain/contracts';
import { useWalletConnectorContext } from '../../../../services/blockchain/wallets/WalletConnector';
import { ToggleTable } from '../../../molecules';
import { LockedTable, VestingTable } from '../index';

import './Table.scss';

interface IActiveTable {
  onChangeLPHandl: (value: string) => void;
  onChangeVsHandl: (value: string) => void;
  onChangeProjAmount: (value: number) => void;
  onChangeTokensAmount: (value: number) => void;
  // amountProject: number;
}

export interface ITableData {
  id: number;
  TOKENS: string;
  TOTAL: string;
  LOCK: string;
  UNLOCK: string;
  ADDRESS_BENEF: string;
  TOKEN_ADDRESS: string;
}

const ActiveTable: React.FC<IActiveTable> = ({
  onChangeLPHandl,
  onChangeVsHandl,
  onChangeProjAmount,
  onChangeTokensAmount,
}) => {
  const [toggleTable, setChangeTable] = React.useState(1);
  const [tableRender, setTableRender] = React.useState(false);

  const [lockedData, setLockedData] = React.useState<ITableData[]>([]);
  const [vestingData, setVestingData] = React.useState<ITableData[]>([]);

  const { wallet } = useWalletConnectorContext();

  React.useEffect(() => {
    const lockerContract = new LockerContract(wallet.getWalletProvider());
    lockerContract.getAllLocks().then((locks) => {
      const uniquesValue: string[] = [];

      const totalLPValue = locks.reduce((acc, lock) => {
        uniquesValue.push(lock.token.address.toLowerCase());
        return acc.plus(lock.amount);
      }, new BigNumber(0));

      const vestingContract = new VestingContract(wallet.getWalletProvider());
      vestingContract.getAllVestings().then((vestings) => {
        const totalVsValue = vestings.reduce((acc, vest) => {
          uniquesValue.push(vest.token.address.toLowerCase());
          return acc.plus(vest.amount);
        }, new BigNumber(0));

        onChangeVsHandl(totalVsValue.toFormat(2, BIG_NUMBER_FORMAT));
        onChangeLPHandl(totalLPValue.toFormat(2, BIG_NUMBER_FORMAT));
        onChangeProjAmount(locks.length + vestings.length);
        onChangeTokensAmount(new Set(uniquesValue).size);
      });
    });
    // eslint-disable-next-line
  }, [wallet, tableRender]);

  return (
    <div className="content_toggle">
      <ToggleTable onToggleHandl={setChangeTable} />
      <div className="content-main">
        {toggleTable === 1 ? (
          <LockedTable
            tableData={lockedData}
            setTableData={setLockedData}
            onSetRenderHandl={setTableRender}
          />
        ) : (
          <VestingTable
            tableData={vestingData}
            setTableData={setVestingData}
            onSetRenderHandl={setTableRender}
          />
        )}
      </div>
    </div>
  );
};

export default ActiveTable;
