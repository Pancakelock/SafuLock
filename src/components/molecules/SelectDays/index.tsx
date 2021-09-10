import React from 'react';
import { Select } from 'antd';

import 'antd/lib/select/style/css';

import ArrowSelect from '../../../assets/img/arrow-select.svg';

import './SelectDays.scss';

const { Option } = Select;

interface ISelectProps {
  option: string;
  changeDate: (opt: string) => void;
  changeSelected: (opt: string) => void;
  handlChangeSelected: (params: string) => void;
}

const SelectDays: React.FC<ISelectProps> = ({
  option,
  changeDate,
  changeSelected,
  handlChangeSelected,
}) => {
  const handleChange = (value: string) => {
    changeDate(value);
    changeSelected(value);
    handlChangeSelected(value);
  };
  return (
    <div className="select-days-bar">
      <Select defaultValue={option} dropdownClassName="select-days" onChange={handleChange}>
        <Option value="Days">Days</Option>
        <Option value="Months">Months</Option>
        <Option value="Years">Years</Option>
      </Select>
      <img src={ArrowSelect} alt="icon" className="select-days-bar-arrow" />
    </div>
  );
};

export default SelectDays;
