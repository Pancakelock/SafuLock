import React from 'react';
import { RadioChangeEvent } from 'antd';
import { observer } from 'mobx-react-lite';

import 'antd/lib/radio/style/css';

import { LockerContract, VestingContract } from '../../../services/blockchain/contracts';
import { useWalletConnectorContext } from '../../../services/blockchain/wallets/WalletConnector';
import { RadioGroup } from '../../atoms';

import './ToggleTable.scss';

interface IToggleTable {
  onToggleHandl: (params: number) => void;
}

const ToggleTable: React.FC<IToggleTable> = observer(({ onToggleHandl }) => {
  const [actualTbl, setChangeTbl] = React.useState(1);
  const [lockedTokensAmount, setLockedTokensAmount] = React.useState(-1);
  const [vestingTokensAmount, setVestingTokensAmount] = React.useState(-1);

  const { wallet } = useWalletConnectorContext();

  const onChangeTableData = (event: RadioChangeEvent) => {
    setChangeTbl(event.target.value);
    onToggleHandl(event.target.value);
  };

  React.useEffect(() => {
    const lockerContract = new LockerContract(wallet.getWalletProvider());
    lockerContract.getAllLocks().then((locks) => setLockedTokensAmount(locks.length));
    const vestingContract = new VestingContract(wallet.getWalletProvider());
    vestingContract.getAllVestings().then((vestings) => setVestingTokensAmount(vestings.length));
  }, [wallet, lockedTokensAmount, vestingTokensAmount]);

  const toggleLocked = (
    <span className="h2 text-yellow">
      Locked Tokens {lockedTokensAmount !== -1 ? <strong>({lockedTokensAmount})</strong> : null}
    </span>
  );

  const toggleVesting = (
    <span className="h2 text-yellow">
      Vesting Tokens {vestingTokensAmount !== -1 ? <strong>({vestingTokensAmount})</strong> : null}
    </span>
  );

  const items = [
    {
      text: toggleLocked,
      value: 1,
    },
    {
      text: toggleVesting,
      value: 2,
    },
  ];

  return (
    <div className="toggle">
      <RadioGroup
        items={items}
        className="toggle_buttons"
        value={actualTbl}
        onChange={onChangeTableData}
      />
    </div>
  );
});

export default ToggleTable;
