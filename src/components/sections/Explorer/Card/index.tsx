import React from 'react';
import cn from 'classnames';

import './Card.scss';

interface ICardProps {
  icon?: string;
  className?: string;
  icon2?: string;
}

const Card: React.FC<ICardProps> = ({ children, icon, className, icon2 = '' }) => {
  const withIcon = (
    <div className="card-exp_body_row">
      <div className="card-exp_body_row-left">
        <img src={icon} alt="icon" className="" />
        {icon2 ? <img src={icon2} alt="icon" className="" /> : null}
      </div>
      <div className="card-exp_body_row-right">{children}</div>
    </div>
  );

  return (
    <div className={cn(className || '', 'card-exp')}>
      <div className="card-exp_body">
        {icon ? withIcon : <div className="card-exp_body_col">{children}</div>}
      </div>
    </div>
  );
};

export default Card;
