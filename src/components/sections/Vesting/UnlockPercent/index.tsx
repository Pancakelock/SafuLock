/* eslint-disable no-param-reassign */
import React from 'react';
import cn from 'classnames';

import { IVestingInput } from '../../../../types';
import { Input } from '../../../atoms';

import './UnlockPercent.scss';

interface IUnlockInput extends IVestingInput {
  tag?: string;
  className?: string;
  itemId: number;
  isSuccess: boolean;
  field: 'percent';
  stateValue: number;
  maxUnlockAmount: number;
  onGetInputSumHandl: (itemId: number, field: 'percent', value: number) => number;
  onSetGroupInputValueHandl: (itemId: number, percent: number, amount: number) => void;
}

const UnlockPercent: React.FC<IUnlockInput> = ({
  tag = '',
  className,
  // onSetInputValueHandl,
  itemId,
  isSuccess,
  field,
  stateValue,
  onGetInputSumHandl,
  maxUnlockAmount,
  onSetGroupInputValueHandl,
}) => {
  const [value, setValue] = React.useState(stateValue);

  const onChangeHandl = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (Number.isNaN(+event.target.value)) {
      setValue((prev) => prev);
    } else if (100 - onGetInputSumHandl(itemId, field, +event.target.value) >= 0) {
      setValue(+event.target.value);
      onSetGroupInputValueHandl(
        itemId,
        +event.target.value,
        (+event.target.value / 100) * maxUnlockAmount,
      );
    } else {
      setValue(0);
    }
  };

  React.useEffect(
    () => {
      setValue(stateValue);
      if (isSuccess) {
        setValue(0);
      }
    },
    // eslint-disable-next-line
    [stateValue, isSuccess],
  );

  React.useEffect(
    () => {
      // onSetInputValueHandl(itemId, 'amount', +((value / 100) * maxUnlockAmount).toFixed(2));
      onSetGroupInputValueHandl(itemId, value, (value / 100) * maxUnlockAmount);
    },
    // eslint-disable-next-line
    [maxUnlockAmount],
  );

  return (
    <div
      className={cn(className || '', 'unlock-percent', { 'unlock-percent-not_valid': value === 0 })}
    >
      <div className="unlock-percent-left">
        <Input
          key={itemId}
          inputSize="sm"
          value={value}
          onChange={onChangeHandl}
          className="unlock-percent-left_input"
        />
      </div>
      <div className="unlock-percent-right">
        <span className="h2 text-gray-const text-bold">{tag}</span>
      </div>
    </div>
  );
};

export default UnlockPercent;
