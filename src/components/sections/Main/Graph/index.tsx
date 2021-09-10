import React from 'react';

import Arrow from '../../../../assets/img/arrow-right.svg';
import Diagram from '../../../../assets/img/diagram.svg';
import { Button } from '../../../atoms';

import './Graph.scss';

const Graph: React.FC = () => {
  return (
    <div className="graph box-c-c br">
      <div className="graph_header box-r-sb">
        <div className="graph_header_title">
          <span className="h4 text-upper text-gray-const text-bold">Sabtu, 5 December 2021</span>
          <span className="h2 text-upper text-bold text-yellow-black">IDR 269,035,910</span>
        </div>
        <div className="graph_header_value">
          <span className="text-yellow">+3.14%</span>
        </div>
      </div>
      <div className="graph_body box-c-c">
        <img src={Diagram} alt="diagram" className="graph_body_image" />
        <div className="graph_body_text">
          <span className="h4 text-gray">
            Buy Crypto with <span className="h2 text-upper text-yellow">0% fee</span> on
            credit/debit card for your first 30days
          </span>
        </div>

        <Button
          type="button"
          size="primary"
          colorScheme="yellow"
          icon={Arrow}
          className="graph_body-btn"
        >
          Install and buy now
        </Button>
      </div>
    </div>
  );
};

export default Graph;
