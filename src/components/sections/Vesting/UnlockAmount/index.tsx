import React from 'react';
import { valueType } from 'antd/es/statistic/utils';
import cn from 'classnames';

import { IVestingInput } from '../../../../types';
import { Input } from '../../../atoms';

import './UnlockAmount.scss';

interface IUnlockInput extends IVestingInput {
  tag?: string;
  className?: string;
  itemId: number;
  field: 'amount';
  stateValue: number;
  maxUnlockAmount: valueType;
  onGetAmountSumHandl: (itemId: number, field: 'amount', value: number) => number;
}

const UnlockAmount: React.FC<IUnlockInput> = ({
  tag = '',
  className,
  itemId,
  field,
  stateValue,
  maxUnlockAmount,
  onSetInputValueHandl,
  onGetAmountSumHandl,
}) => {
  const [value, setValue] = React.useState(stateValue);

  const onChangeHandl = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (Number.isNaN(+event.target.value)) {
      setValue((prev) => prev);
    } else if (+maxUnlockAmount - onGetAmountSumHandl(itemId, field, +event.target.value) >= 0) {
      setValue(+event.target.value);
      onSetInputValueHandl(itemId, field, +event.target.value);
    } else setValue(0);
  };

  React.useEffect(
    () => {
      setValue(stateValue);
    },
    // eslint-disable-next-line
    [stateValue, +maxUnlockAmount],
  );

  return (
    <div className={cn(className || '', 'unlock-amount')}>
      <div className="unlock-amount-left">
        <Input
          inputSize="sm"
          value={value.toFixed(2)}
          onChange={onChangeHandl}
          className="unlock-amount_input"
          disabled
        />
      </div>
      <div className="unlock-amount-right">
        <span className="h2 text-gray-const text-bold">{tag}</span>
      </div>
    </div>
  );
};

export default UnlockAmount;
