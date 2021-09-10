import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { BIG_NUMBER_FORMAT } from '../../../../constants/BIG_NUMBER_FORMAT';
import { VestingContract } from '../../../../services/blockchain/contracts';
import { useWalletConnectorContext } from '../../../../services/blockchain/wallets/WalletConnector';
import { Search } from '../../../atoms';
import Loader from '../../../atoms/Loader';
import { ITableData } from '../ActiveTable';

interface IVestingTable {
  onSetRenderHandl: (params: boolean) => void;
  tableData: ITableData[];
  setTableData: (data: ITableData[]) => void;
}

const VestingTable: React.FC<IVestingTable> = observer(
  ({ tableData, setTableData, onSetRenderHandl }) => {
    const [isLoading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [finishLoading, setFinishLoading] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    const { wallet } = useWalletConnectorContext();

    function getFormattedDate(date: Date): string {
      return `${date.getDate().toString().padStart(2, '0')}-${date
        .getMonth()
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;
    }

    const handlSearchData = (value: string | number) => {
      const vestingContract = new VestingContract(wallet.getWalletProvider());
      vestingContract.getAllVestings().then((vestings) => {
        const loadingData = vestings.map((vest) => ({
          id: vest.id,
          TOKENS: `${vest.token.name}(${vest.token.symbol})`,
          TOTAL: vest.amount.toFormat(BIG_NUMBER_FORMAT),
          LOCK: getFormattedDate(vest.lockDate),
          UNLOCK: getFormattedDate(vest.maxUnlockDate),
          ADDRESS_BENEF: vest.withdrawalAddress,
          TOKEN_ADDRESS: vest.token.address,
        }));
        const newData = loadingData.filter(
          (item) =>
            item.TOKENS.toLowerCase().includes(value.toString().toLowerCase()) ||
            item.TOTAL.toLowerCase().includes(value.toString().toLowerCase()) ||
            item.LOCK.toLowerCase().includes(value.toString().toLowerCase()) ||
            item.UNLOCK.toLowerCase().includes(value.toString().toLowerCase()) ||
            item.ADDRESS_BENEF.toLowerCase().includes(value.toString().toLowerCase()) ||
            item.TOKEN_ADDRESS.toLowerCase().includes(value.toString().toLowerCase()),
        );
        if (newData.length > 0) {
          setNotFound(false);
          setTableData(newData);
          setFinishLoading(true);
        } else setNotFound(true);
      });

      if (value === '') {
        setTableData([]);
        setFinishLoading(false);
        setCurrentPage(1);
        setLoading(true);
      } else setNotFound(true);
    };

    const scrollHandler = (e: any) => {
      if (
        e.target.documentElement.scrollHeight -
          (e.target.documentElement.scrollTop + window.innerHeight) <
          700 &&
        !finishLoading
      ) {
        setLoading(true);
      }
    };

    React.useEffect(() => {
      document.addEventListener('scroll', scrollHandler);

      return () => {
        document.removeEventListener('scroll', scrollHandler);
        setTableData([]);
      };
      // eslint-disable-next-line
    }, []);

    React.useEffect(() => {
      if (isLoading && !finishLoading) {
        const vestingContract = new VestingContract(wallet.getWalletProvider());
        vestingContract
          .getAllVestings()
          .then((vestings) => {
            const arrLength = vestings.length;

            if (arrLength === 0) {
              setNotFound(true);
              setLoading(false);
            } else if (arrLength <= 20) {
              setTableData(
                vestings.map((vest) => ({
                  id: vest.id,
                  TOKENS: `${vest.token.name}(${vest.token.symbol})`,
                  TOTAL: vest.amount.toFormat(BIG_NUMBER_FORMAT),
                  LOCK: getFormattedDate(vest.lockDate),
                  UNLOCK: getFormattedDate(vest.maxUnlockDate),
                  ADDRESS_BENEF: vest.withdrawalAddress,
                  TOKEN_ADDRESS: vest.token.address,
                })),
              );
              setLoading(false);
              setFinishLoading(true);
            } else {
              const pages = Math.ceil(arrLength / 20);
              const result: ITableData[] = [];

              if (pages === currentPage) {
                vestings.forEach((vest, index) => {
                  if (index >= 20 * (currentPage - 1)) {
                    result.push({
                      id: vest.id,
                      TOKENS: `${vest.token.name}(${vest.token.symbol})`,
                      TOTAL: vest.amount.toFormat(BIG_NUMBER_FORMAT),
                      LOCK: getFormattedDate(vest.lockDate),
                      UNLOCK: getFormattedDate(vest.maxUnlockDate),
                      ADDRESS_BENEF: vest.withdrawalAddress,
                      TOKEN_ADDRESS: vest.token.address,
                    });
                  }
                });
                setTableData(tableData.concat(result));
                setFinishLoading(true);
              } else {
                vestings.forEach((vest, index) => {
                  if (index + 1 >= 20 * (currentPage - 1) && index + 1 <= 20 * currentPage) {
                    result.push({
                      id: vest.id,
                      TOKENS: `${vest.token.name}(${vest.token.symbol})`,
                      TOTAL: vest.amount.toFormat(BIG_NUMBER_FORMAT),
                      LOCK: getFormattedDate(vest.lockDate),
                      UNLOCK: getFormattedDate(vest.maxUnlockDate),
                      ADDRESS_BENEF: vest.withdrawalAddress,
                      TOKEN_ADDRESS: vest.token.address,
                    });
                  }
                });
                setTableData(tableData.concat(result));
                setCurrentPage((prev) => prev + 1);
              }
              setLoading(false);
            }
          })
          .catch(() => {
            setNotFound(true);
            setLoading(false);
          });
      }
      onSetRenderHandl(true);
      // eslint-disable-next-line
    }, [wallet, isLoading]);

    const Table = () => {
      if (tableData.length) {
        return (
          <>
            <table className="table-locked-desktop">
              <thead>
                <tr>
                  <th>TOKENS</th>
                  <th>TOTAL LP LOCKED</th>
                  <th>LOCK DATA</th>
                  <th>UNLOCK DATA</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item) => {
                  return (
                    <tr key={item.id} className="text-bold">
                      <td>
                        <Link to={`/explorer/locker/${item.id}`}>{item.TOKENS}</Link>
                      </td>
                      <td>{item.TOTAL}</td>
                      <td>{item.LOCK}</td>
                      <td>{item.UNLOCK}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <table className="table-locked-mobile">
              <tbody>
                {tableData.map((item) => {
                  return (
                    <tr key={item.id} className="text-bold">
                      <td>
                        <span className="h4 text-yellow">TOKENS</span>
                        <Link to={`/explorer/vesting/${item.id}`}>{item.TOKENS}</Link>
                      </td>
                      <td>
                        <span className="h4 text-yellow">TOTAL LP LOCKED</span>
                        <Link to={`/explorer/vesting/${item.id}`}>{item.TOTAL}</Link>
                      </td>
                      <td>
                        <span className="h4 text-yellow">LOCK DATA</span>
                        <Link to={`/explorer/vesting/${item.id}`}>{item.LOCK}</Link>
                      </td>
                      <td>
                        <span className="h4 text-yellow">UNLOCK DATA</span>
                        <Link to={`/explorer/vesting/${item.id}`}>{item.UNLOCK}</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {isLoading && !finishLoading ? <Loader /> : null}
          </>
        );
      }
      return (
        <div className="text-bold text-white-black text-center">
          You don&apos;t have Locked Tokens
        </div>
      );
    };

    return (
      <>
        {!tableData.length ? (
          <>
            <Search
              realtime
              placeholder="Search here..."
              className="content-main_search"
              onChange={(event) => handlSearchData(event)}
            />
            {notFound ? (
              <span className="h2 text-white-black text-center">Not Found</span>
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <>
            <Search
              realtime
              placeholder="Search here..."
              className="content-main_search"
              onChange={(event) => handlSearchData(event)}
            />
            {notFound ? (
              <span className="h2 text-white-black text-center">Not Found</span>
            ) : (
              <Table />
            )}
          </>
        )}
      </>
    );
  },
);

export default VestingTable;
