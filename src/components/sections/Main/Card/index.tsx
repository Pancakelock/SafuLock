import React from 'react';

import './Card.scss';

export interface ICardProps {
  title: string;
  value: number | string;
  image: string;
}

const Card: React.FC<ICardProps> = ({ title, value, image }) => {
  return (
    <div className="card-main br">
      <div className="card-main-left">
        <img src={image} alt="graph" />
      </div>

      <div className="card-main-right">
        <span className="h4 text-upper text-gray-const text-bold">{title}</span>
        <span className="h2 text-upper text-yellow-black text-bold text-left">{value}</span>
      </div>
    </div>
  );
};

export default Card;
