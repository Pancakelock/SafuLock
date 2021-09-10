import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import BigNumber from 'bignumber.js/bignumber';
import cn from 'classnames';

import './FieldValue.scss';

interface IBoxProps {
  title: string;
  value: string | number | ReactElement;
  text?: string;
  color?: 'yellow' | 'white';
  bold?: boolean;
  className?: string;
  link?: string;
}

const FieldValue: React.FC<IBoxProps> = ({
  title,
  value,
  text,
  className,
  color = 'white-black',
  bold,
  link,
}) => {
  BigNumber.config({ DECIMAL_PLACES: 100 });

  const roundNumber = (val: BigNumber): string => {
    const stringValue = val.toFixed();
    const [integerPart, decimalsPart] = stringValue.split('.');
    if (!decimalsPart) {
      return stringValue;
    }
    let newDecimalsPart;
    if (val.gt(1)) {
      newDecimalsPart = decimalsPart.slice(0, 5);
    } else {
      let pos = 0;
      for (; pos < decimalsPart.length; pos += 1) {
        if (decimalsPart[pos] !== '0') {
          break;
        }
      }
      newDecimalsPart = decimalsPart.slice(0, pos + 6);
    }
    return `${integerPart}.${newDecimalsPart}`;
  };
  return (
    <div className={cn(className || '', 'box')}>
      <div className="box_title">
        <span className="h4 text-gray text-upper">{title}</span>
      </div>
      <div className="box_body">
        {link ? (
          <Link to={link}>
            <span className={`text-${color} ${bold ? 'text-bold' : null}`}>{value}</span>
          </Link>
        ) : (
          <>
            {text ? (
              <>
                <ReactTooltip />
                <span
                  data-tip={roundNumber(new BigNumber(+value))}
                  className={`text-${color} ${bold ? 'text-bold' : null}`}
                >
                  {`${(+value).toFixed(4)}  ${text}`}
                </span>
              </>
            ) : (
              <span className={`text-${color} ${bold ? 'text-bold' : null}`}>{value}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default FieldValue;
