import React from 'react';
import { InputNumber as Input } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';
import cn from 'classnames';

import 'antd/lib/input-number/style/css';

import './InputNumber.scss';

interface IInputNumberProps extends InputNumberProps {
  inputSize?: 'lg' | 'md' | 'sm';
  colorScheme?: 'gray' | 'outline' | 'transparent' | 'white';
  inputPrefix?: string | React.ReactElement;
  prefixPosition?: 'right' | 'left' | 'top' | 'button';
  inputClass?: string;
  isValid?: boolean;
  ref?: React.ForwardedRef<HTMLInputElement>;
}

const InputNumber: React.ForwardRefExoticComponent<IInputNumberProps> = React.memo(
  React.forwardRef<HTMLInputElement, IInputNumberProps>((props, ref) => {
    const {
      inputSize = 'sm',
      colorScheme = 'gray',
      inputPrefix,
      className,
      inputClass,
      value,
      isValid = false,
      prefixPosition = 'right',
      ...otherProps
    } = props;
    return (
      <div
        className={cn(
          'input-number__box box-f',
          `input-number-${inputSize}-box`,
          `input-number-${colorScheme}-box`,
          className,
          {
            'box-f-ai-c': prefixPosition === 'right',
            'box-f-fd-c': prefixPosition === 'button',
          },
          { 'input-number__box-isValid': isValid },
        )}
      >
        <Input
          type="number"
          ref={ref}
          className={cn(
            'input-number',
            `input-number-${inputSize}`,
            `input-number-${colorScheme}`,
            inputClass,
          )}
          value={value}
          onWheel={(e: any) => {
            e.target.blur();
          }}
          {...otherProps}
        />
        {inputPrefix ? (
          <div
            className={cn('input-number__prefix', {
              'input-number__prefix-bottom': prefixPosition === 'button',
            })}
          >
            {inputPrefix}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }),
);

export default InputNumber;
