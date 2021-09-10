import React from 'react';
import { valueType } from 'antd/es/statistic/utils';

import { InputNumber } from '../../../atoms';
import { SelectDays } from '../../../molecules';

import './Days.scss';

interface IDaysProps {
  date: string;
  onSetNewDateHandl: (unlockDay: number, value: string) => void;
}

const Days: React.FC<IDaysProps> = ({ onSetNewDateHandl, date }) => {
  const [unlockDay, setUnlockDay] = React.useState<number>(7);
  const [option, setOption] = React.useState('Days');
  const [selectedParams, setSelectedParams] = React.useState<string>('days');

  const onSetDate = (event: valueType) => {
    if (+event >= 7) {
      // setUnlockDay(7);
      setUnlockDay(+event);
      onSetNewDateHandl(unlockDay, option);
    } else {
      setUnlockDay(7);
    }
  };

  const onChangeDateHandl = (value: string) => {
    onSetNewDateHandl(unlockDay, value);
  };

  return (
    <div className="days">
      <div className="days-left">
        <InputNumber
          type="number"
          value={unlockDay}
          onChange={(event) => onSetDate(event)}
          onBlur={() => onSetDate(unlockDay)}
          className="days-left_value"
          colorScheme="outline"
        />
        <span className="h4 text-gray-const text-upper">unlock {selectedParams}</span>
      </div>
      <div className="days-right">
        <SelectDays
          option={option}
          changeDate={onChangeDateHandl}
          changeSelected={setOption}
          handlChangeSelected={setSelectedParams}
        />
        <span className="h3 text-gray-const">{date}</span>
      </div>
    </div>
  );
};

export default Days;
