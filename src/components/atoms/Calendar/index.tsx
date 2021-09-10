/* eslint-disable no-plusplus */
import React from 'react';
import { Calendar as AntdCalendar, Col, Radio, Row, Select } from 'antd';
import moment from 'moment';

import 'antd/lib/calendar/style/css';

import { IVestingDate } from '../../../types';

import './Calendar.scss';

interface ICalendar extends IVestingDate {
  itemId: number;
  setDate: (date: Date) => void;
  // onCloseModalHandl?: (params: boolean) => void;
}

const Calendar: React.FC<ICalendar> = ({
  onSetDateHandl,
  itemId,
  setDate,
  // onCloseModalHandl
}) => {
  const selectDateHandl = (calendarDate: any) => {
    const date = new Date(calendarDate);
    const minDate = new Date(Date.now() + 60000 * 60 * 24 * 7 + 6000 * 10);

    if (minDate.getTime() > date.getTime()) {
      setDate(minDate);
      onSetDateHandl(itemId, 'date', minDate);
    } else {
      setDate(date);
      onSetDateHandl(itemId, 'date', date);
    }
    const now = moment().format('MMMM Do YYYY, h:mm:ss a').toString().toLowerCase().split(' ')[0];
    const found = date.toString().toLowerCase().split(' ')[1];
    if (now.toLowerCase().includes(found.toLowerCase())) {
      // onCloseModalHandl(true);
    }
  };

  return (
    <div className="calendar">
      <AntdCalendar
        fullscreen={false}
        headerRender={({ value, type, onChange, onTypeChange }) => {
          const start = 0;
          const end = 12;
          const monthOptions = [];

          const current = value.clone();
          const localeData = value.localeData();
          const months = [];
          for (let i = 0; i < 12; i++) {
            current.month(i);
            months.push(localeData.monthsShort(current));
          }

          for (let index = start; index < end; index++) {
            monthOptions.push(
              <Select.Option className="month-item" key={`${index}`} value={`${index}`}>
                {months[index]}
              </Select.Option>,
            );
          }
          const month = value.month();

          const year = value.year();
          const options = [];
          for (let i = year - 10; i < year + 10; i += 1) {
            options.push(
              <Select.Option key={i} value={i} className="year-item">
                {i}
              </Select.Option>,
            );
          }
          for (let index = start; index < end; index++) {
            monthOptions.push(
              <Select.Option className="month-item" key={`${index}`} value={months[index]}>
                {months[index]}
              </Select.Option>,
            );
          }

          return (
            <div style={{ padding: 5 }}>
              <Row gutter={8}>
                <Col>
                  <Radio.Group
                    size="small"
                    onChange={(e) => onTypeChange(e.target.value)}
                    value={type}
                  >
                    {/* <Radio.Button value="month">Days</Radio.Button> */}
                  </Radio.Group>
                </Col>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    className="my-year-select"
                    onChange={(newYear) => {
                      const now = value.clone().year(+newYear);
                      onChange(now);
                    }}
                    value={String(year)}
                  >
                    {options}
                  </Select>
                </Col>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    value={String(month)}
                    onChange={(selectedMonth) => {
                      const newValue = value.clone();
                      newValue.month(parseInt(selectedMonth, 10));
                      onChange(newValue);
                    }}
                  >
                    {monthOptions}
                  </Select>
                </Col>
              </Row>
            </div>
          );
        }}
        onSelect={selectDateHandl}
      />
    </div>
  );
};

export default Calendar;
