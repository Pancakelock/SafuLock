import React from 'react';
import { Input as AntdInput } from 'antd';
import { InputProps } from 'antd/lib/input';
import cn from 'classnames';

import 'antd/lib/input/style/css';

import './Input.scss';

interface IInput extends InputProps {
  colorScheme?: 'transparent' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  ref?: React.ForwardedRef<AntdInput>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.ForwardRefExoticComponent<IInput> = React.memo(
  React.forwardRef<AntdInput, IInput>((props, ref) => {
    const {
      colorScheme = 'transparent',
      inputSize = 'sm',
      className,
      onChange,
      ...therProps
    } = props;
    return (
      <AntdInput
        className={cn(
          'input',
          `${colorScheme ? `input-${colorScheme}` : ''}`,
          `${inputSize ? `input-${inputSize}` : ''}`,
          className,
        )}
        ref={ref}
        onChange={onChange}
        {...therProps}
      />
    );
  }),
);

export default Input;
