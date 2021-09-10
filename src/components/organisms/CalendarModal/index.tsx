import React from 'react';

import Close from '../../../assets/img/close.svg';
import { IModalProps, IVestingDate } from '../../../types';
import { Button, Calendar } from '../../atoms';

import './CalendarModal.scss';

interface ICalendarModal extends IVestingDate, IModalProps {
  itemId: number;
  setDate: (date: Date) => void;
}

const CalendarModal: React.FC<ICalendarModal> = ({
  handleChangeOpen,
  itemId,
  onSetDateHandl,
  setDate,
}) => {
  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  return (
    <>
      <div className="card_overlay" onClick={onCloseModal} role="presentation" />
      <div className="card-calendar">
        <Button icon={Close} close size="close" colorScheme="none" onClick={onCloseModal} />
        <div className="card-calendar_body">
          <Calendar
            itemId={itemId}
            onSetDateHandl={onSetDateHandl}
            setDate={setDate}
            // onCloseModalHandl={onCloseModal}
          />
        </div>
      </div>
    </>
  );
};

export default CalendarModal;
