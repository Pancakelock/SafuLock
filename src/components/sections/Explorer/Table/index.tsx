import React, { useEffect } from 'react';
import moment from 'moment';

import ArrowRight from '../../../../assets/img/arrow-right.svg';
import { BIG_NUMBER_FORMAT } from '../../../../constants/BIG_NUMBER_FORMAT';
import { IExplorerTableLock } from '../../../../types';
import { Button } from '../../../atoms';

import './Table.scss';

interface ITableProps {
  locks: IExplorerTableLock[];
  onClaim: (id: number) => void;
}

interface ITableData {
  id: number;
  BENEFICIARY: string;
  VALUE: string;
  UNLOCK: Date;
}

const Table: React.FC<ITableProps> = ({ locks, onClaim }) => {
  const [tableData, setTableData] = React.useState<ITableData[]>([]);

  useEffect(() => {
    setTableData(
      locks.map((lock) => ({
        id: lock.id,
        BENEFICIARY: lock.withdrawalAddress,
        VALUE: lock.amount.toFormat(BIG_NUMBER_FORMAT),
        UNLOCK: lock.unlockDate,
      })),
    );
  }, [locks]);

  function isWithdrawn(id: number): boolean {
    return !!locks.find((lock) => lock.id === id)?.withdrawn;
  }

  function isInProgress(id: number): boolean {
    return !!locks.find((lock) => lock.id === id)?.inProgress;
  }

  const isTokenUnlocked = (unlockDate: Date) => {
    return Date.now() > unlockDate.getTime();
  };

  const Withdrawing = ({ id }: { id: number }) => {
    if (!isWithdrawn(id)) {
      return (
        <Button
          type="button"
          colorScheme="yellow"
          size="primary"
          icon={ArrowRight}
          loading={isInProgress(id)}
          onClick={() => onClaim(id)}
        >
          Claim
        </Button>
      );
    }
    return <span>Withdrawn</span>;
  };

  return (
    <div className="content-exp">
      <>
        <table className="content-exp-desktop">
          <thead>
            <tr>
              <th>BENEFICIARY</th>
              <th>VALUE</th>
              <th>UNLOCK DATA</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => {
              return (
                <tr key={item.id} className="text-bold">
                  <td>
                    <span>{item.BENEFICIARY}</span>
                  </td>
                  <td>
                    <span>
                      {item.VALUE} <strong className="text-yellow">Cake-LP</strong>
                    </span>
                  </td>
                  <td>
                    <span>
                      {!isTokenUnlocked(item.UNLOCK) ? (
                        moment(item.UNLOCK).format('HH:mm, Do of MMM YYYY')
                      ) : (
                        <Withdrawing id={item.id} />
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table className="content-exp-mobile">
          <tbody>
            {tableData.map((item) => {
              return (
                <tr key={item.id} className="text-bold">
                  <td>
                    <span className="h4 text-yellow">BENEFICIARY</span>
                    <span className="content-exp-mobile_benef">{item.BENEFICIARY}</span>
                  </td>
                  <td>
                    <span className="h4 text-yellow">VALUE</span>
                    <span>
                      {item.VALUE} <strong className="text-yellow">Cake-LP</strong>
                    </span>
                  </td>
                  <td>
                    <span className="h4 text-yellow">UNLOCK DATA</span>
                    <span>
                      {!isTokenUnlocked(item.UNLOCK)
                        ? moment(item.UNLOCK).format('HH:mm, Do of MMM YYYY')
                        : null}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    </div>
  );
};

export default Table;
