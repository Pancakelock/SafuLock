import React from 'react';
import cn from 'classnames';
import moment from 'moment';

import { IVestingDate } from '../../../../types';
import { Button } from '../../../atoms';
import { Calendar } from '../../../organisms';

import './UnlockDate.scss';

interface IUnlockDate extends IVestingDate {
  icon?: string;
  color?: string;
  className?: string;
  stateValue: Date;
  itemId: number;
}

const UnlockDate: React.FC<IUnlockDate> = ({
  icon,
  className,
  stateValue,
  color = 'yellow-black',
  onSetDateHandl,
  itemId,
}) => {
  const [isCalendarOpen, setShowCalendar] = React.useState(false);
  const [selectedDate, setDate] = React.useState(stateValue);

  const showCalendar = () => {
    setShowCalendar((prev) => !prev);
  };
  return (
    <>
      {isCalendarOpen ? (
        <Calendar
          handleChangeOpen={showCalendar}
          onSetDateHandl={onSetDateHandl}
          itemId={itemId}
          setDate={setDate}
        />
      ) : null}
      <div className={cn(className || '', 'unlock-date')}>
        <Button
          icon={icon}
          size="img"
          colorScheme="none"
          className="unlock-date_btn"
          onClick={showCalendar}
        >
          <span className={`text-${color} wrap-any`}>
            {moment(selectedDate).format('MMMM Do YYYY, h:mm A')}
          </span>
        </Button>
      </div>
    </>
  );
};

export default UnlockDate;
