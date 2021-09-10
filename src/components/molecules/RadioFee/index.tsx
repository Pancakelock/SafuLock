import React, { useEffect } from 'react';
import { Radio, RadioChangeEvent, Space } from 'antd';

import 'antd/lib/radio/style/css';

import './RadioFee.scss';

const RadioFee: React.FC<{ setFeeInBnb: (param: boolean) => void }> = ({ setFeeInBnb }) => {
  const [value, setValue] = React.useState<number>(2);

  const onSelectFee = (event: RadioChangeEvent) => {
    const selectedValue = event.target.value;
    setValue(selectedValue);
    setFeeInBnb(selectedValue === 2);
  };

  useEffect(() => {
    setFeeInBnb(value === 2);
  }, [setFeeInBnb, value]);

  return (
    <div className="radio box-c-l">
      <span className="h3 text-yellow text-bold">Fees options</span>
      <Radio.Group value={value} onChange={onSelectFee}>
        <Space direction="vertical">
          <Radio value={1}>
            Pay fee <strong>0.5%</strong> of the amount
          </Radio>
          <Radio value={2}>
            Pay fee in <strong>1 BNB</strong>
          </Radio>
        </Space>
      </Radio.Group>
    </div>
  );
};

export default RadioFee;
