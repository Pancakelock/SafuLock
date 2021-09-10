import React from 'react';
import { Link } from 'react-router-dom';
import { Button as BtnAntd } from 'antd';
import cn from 'classnames';

import 'antd/lib/button/style/css';

import './Button.scss';

export interface IColorScheme {
  colorScheme?: 'yellow' | 'white-btn' | 'none';
}

export interface ISize {
  size?: 'primary' | 'secondary' | 'img' | 'close';
}

export interface ButtonProps extends IColorScheme, ISize {
  onClick?: (e?: any) => void;
  onBlur?: (e?: any) => void;
  onFocus?: (e?: any) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  link?: string;
  linkClassName?: string;
  shadow?: boolean;
  icon?: string;
  type?: 'submit' | 'button' | 'reset';
  close?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  size = 'primary',
  colorScheme = 'yellow',
  onClick,
  onBlur,
  onFocus,
  disabled = false,
  // notValid = false,
  loading = false,
  link,
  linkClassName,
  icon,
  type = 'button',
}) => {
  const BtnContent = (
    <>
      {children}
      {icon ? <img src={icon} alt="icon" className="btn-icon" /> : <></>}
    </>
  );

  const Btn = (
    <BtnAntd
      onClick={onClick}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled || loading}
      htmlType={type}
      className={cn(className || '', 'text text-bold btn', `btn-${size}`, `btn-${colorScheme}`, {
        'btn-loading': loading,
      })}
    >
      {loading ? 'In progress...' : BtnContent}
    </BtnAntd>
  );
  if (link) {
    return (
      <Link className={cn('btn-link', linkClassName)} to={link}>
        {Btn}
      </Link>
    );
  }
  return Btn;
};

export default Button;
