import React from 'react';
import { Input as AntdInput } from 'antd';
import cn from 'classnames';

import LupaImg from '../../../assets/img/search.svg';
import { Button, Input, InputNumber } from '..';

import './Search.scss';

interface ISearch {
  size?: 'sm' | 'lg' | 'md';
  realtime?: boolean;
  type?: 'text' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: number | string) => void;
  btn?: boolean;
  colorScheme?: 'transparent' | 'gray';
  className?: string;
}

const Search: React.FC<ISearch> = React.memo(
  ({
    type = 'text',
    placeholder,
    size = 'sm',
    realtime,
    onChange,
    btn,
    colorScheme = 'transparent',
    className,
    value,
  }) => {
    const [inputValue, setInputValue] = React.useState<number | string>(value || '');

    const inputRef = React.useRef<AntdInput>(null);
    const inputNumberRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (impValue: number | string) => {
      setInputValue(impValue);
      if (realtime && onChange) {
        onChange(impValue);
      }
    };

    const handleImgClick = () => {
      if (inputValue) {
        return onChange && onChange(inputValue);
      }
      if (type === 'text') {
        return inputRef.current && inputRef.current.focus();
      }
      if (type === 'number') {
        return inputNumberRef.current && inputNumberRef.current.focus();
      }
      return undefined;
    };

    const handleEnterDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // && e.currentTarget.value
      if (e.key === 'Enter') {
        return onChange && onChange(inputValue);
      }
      return undefined;
    };

    return (
      <div className={cn('search ', `input-${size}`, `search-${colorScheme}`, className)}>
        <div
          className="search__img"
          onClick={handleImgClick}
          onKeyDown={handleImgClick}
          role="button"
          tabIndex={-1}
        >
          <img src={LupaImg} alt="search" />
        </div>
        {type === 'number' ? (
          <InputNumber
            onChange={handleChange}
            onKeyDown={handleEnterDown}
            colorScheme="transparent"
            ref={inputNumberRef}
            inputSize={size}
            value={inputValue}
            inputClass={cn({
              'text-md': size === 'lg',
            })}
          />
        ) : (
          ''
        )}
        {type === 'text' ? (
          <Input
            value={inputValue}
            className={cn({
              'text-md': size === 'lg',
              'text': size === 'sm',
            })}
            ref={inputRef}
            placeholder={placeholder}
            onChange={(e: any) => handleChange(e.target.value)}
            onKeyDown={handleEnterDown}
            colorScheme="transparent"
          />
        ) : (
          ''
        )}
        {btn ? <Button onClick={handleImgClick}>Search</Button> : ''}
      </div>
    );
  },
);

export default Search;
