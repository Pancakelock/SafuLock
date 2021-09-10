import React from 'react';
import { valueType } from 'antd/es/statistic/utils';

import CalendarYel from '../../../../assets/img/calendar-yellow.svg';
import Close from '../../../../assets/img/close-box.svg';
import { ITableData } from '../../../../pages/Vesting';
import { IVestingProps } from '../../../../types';
import { Button } from '../../../atoms';
import { ITokenName } from '../../Configure/Tokens';
import { UnlockAmount, UnlockDate, UnlockPercent } from '../index';

import './UnlockTable.scss';

interface IUnlockTable extends IVestingProps {
  maxUnlockAmount: valueType;
  items: ITableData[];
  tokenName: ITokenName;
  isSuccess: boolean;
  onDeleteItemHandl: (itemId: number) => void;
  onGetInputSumHandl: (itemId: number, field: 'percent' | 'amount', value: number) => number;
  onSetGroupInputValueHandl: (itemId: number, percent: number, amount: number) => void;
}

const UnlockTable: React.FC<IUnlockTable> = ({
  maxUnlockAmount,
  items,
  isSuccess,
  onSetDateHandl,
  onDeleteItemHandl,
  onSetInputValueHandl,
  onGetInputSumHandl,
  tokenName,
  onSetGroupInputValueHandl,
}) => {
  return (
    <>
      <table className="table-unlock-desktop">
        <thead>
          <tr>
            <th className="h4 text-white-black text-upper">Unlock percent</th>
            <th className="h4 text-white-black text-upper">Unlock amount</th>
            <th className="h4 text-white-black text-upper">Unlock date</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            return (
              <tr key={item.id}>
                <td>
                  <UnlockPercent
                    maxUnlockAmount={+maxUnlockAmount}
                    tag="%"
                    itemId={item.id}
                    stateValue={item.percent}
                    isSuccess={isSuccess}
                    field="percent"
                    onSetInputValueHandl={onSetInputValueHandl}
                    onGetInputSumHandl={onGetInputSumHandl}
                    onSetGroupInputValueHandl={onSetGroupInputValueHandl}
                  />
                </td>
                <td>
                  <UnlockAmount
                    maxUnlockAmount={maxUnlockAmount}
                    tag={tokenName.symbol}
                    itemId={item.id}
                    stateValue={item.amount}
                    field="amount"
                    onSetInputValueHandl={onSetInputValueHandl}
                    onGetAmountSumHandl={onGetInputSumHandl}
                  />
                </td>
                <td>
                  <UnlockDate
                    icon={CalendarYel}
                    stateValue={item.date}
                    itemId={item.id}
                    onSetDateHandl={onSetDateHandl}
                  />
                </td>
                {items.length > 2 ? (
                  <td>
                    <Button
                      icon={Close}
                      type="button"
                      size="secondary"
                      className="table-unlock-desktop-btn"
                      onClick={() => onDeleteItemHandl(item.id)}
                    />
                  </td>
                ) : (
                  <td />
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <table className="table-unlock-mobile">
        <tbody>
          {items.map((item) => {
            return (
              <tr key={item.id} className="table-unlock-mobile_row">
                <td className="table-unlock-mobile_coll">
                  <span className="h4 text-white-black text-upper">Unlock percent</span>
                  <UnlockPercent
                    maxUnlockAmount={+maxUnlockAmount}
                    isSuccess={isSuccess}
                    tag="%"
                    itemId={item.id}
                    stateValue={item.percent}
                    field="percent"
                    onSetInputValueHandl={onSetInputValueHandl}
                    onGetInputSumHandl={onGetInputSumHandl}
                    onSetGroupInputValueHandl={onSetGroupInputValueHandl}
                  />
                </td>
                <td className="table-unlock-mobile_coll">
                  <span className="h4 text-white-black text-upper">Unlock amount</span>
                  <UnlockAmount
                    maxUnlockAmount={maxUnlockAmount}
                    tag={tokenName.symbol}
                    itemId={item.id}
                    stateValue={item.amount}
                    field="amount"
                    onSetInputValueHandl={onSetInputValueHandl}
                    onGetAmountSumHandl={onGetInputSumHandl}
                  />
                </td>
                <td className="table-unlock-mobile_coll">
                  <span className="h4 text-white-black text-upper">Unlock date</span>
                  <UnlockDate
                    icon={CalendarYel}
                    stateValue={item.date}
                    itemId={item.id}
                    onSetDateHandl={onSetDateHandl}
                  />
                </td>
                {items.length > 2 ? (
                  <td className="table-unlock-mobile_coll">
                    <Button
                      icon={Close}
                      type="button"
                      size="secondary"
                      className="table-unlock-mobile-btn"
                      onClick={() => onDeleteItemHandl(item.id)}
                    />
                  </td>
                ) : (
                  <td />
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default UnlockTable;
