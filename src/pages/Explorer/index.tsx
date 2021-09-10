import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import BigNumber from 'bignumber.js/bignumber';
import { observer } from 'mobx-react-lite';

import ArrowRight from '../../assets/img/arrow-right.svg';
import LockWhite from '../../assets/img/lock-little-white.svg';
import LockBlack from '../../assets/img/lock-little.svg';
import AXS from '../../assets/img/tokens/AXS.svg';
import BUSD from '../../assets/img/tokens/BUSD.svg';
import C98 from '../../assets/img/tokens/C98.svg';
import CAKE from '../../assets/img/tokens/CAKE.svg';
import SPS from '../../assets/img/tokens/SPS.svg';
import Unknown from '../../assets/img/tokens/unknow.svg';
import WBNB from '../../assets/img/tokens/WBNB.svg';
import { Button } from '../../components/atoms';
import { Card, Table } from '../../components/sections/Explorer/index';
import { BIG_NUMBER_FORMAT } from '../../constants/BIG_NUMBER_FORMAT';
import { LockerContract, VestingContract } from '../../services/blockchain/contracts';
import { ILock } from '../../services/blockchain/contracts/types/ILock';
import { IVesting } from '../../services/blockchain/contracts/VestingContract';
import { useWalletConnectorContext } from '../../services/blockchain/wallets/WalletConnector';
import { Web3Public } from '../../services/blockchain/web3/web3-public';
import { useMst } from '../../store';
import { IExplorerTableLock, ILPToken } from '../../types';

import './Explorer.scss';

interface IToken {
  name: string;
  address: string;
  totalSupply: BigNumber;
  totalLocked: BigNumber;
  image?: string;
  imageFront?: string;
  imageBack?: string;
  checked?: boolean;
}

const Explorer: React.FC = observer(() => {
  const { lpTokens, tokens } = useMst();
  const [tokensLp] = React.useState<ILPToken[]>(lpTokens.default);
  const [tokensDefault] = React.useState<IToken[]>(tokens.default);

  const location = useLocation();
  const [isLocker] = React.useState<boolean>(location.pathname.split('/')[2] === 'locker');
  const [id] = React.useState<number>(+location.pathname.split('/')[3]);
  const [locks, setLocks] = React.useState<IExplorerTableLock[]>([]);
  const [token, setToken] = React.useState<IToken>({} as IToken);

  const { user } = useMst();
  const { wallet } = useWalletConnectorContext();

  const setLockedToken = async (lockOrVesting: ILock | IVesting) => {
    const lockedToken = lockOrVesting.token;
    const totalSupply = Web3Public.fromWei(
      (await new Web3Public().getTokenInfo(lockedToken.address, ['totalSupply'])).totalSupply,
      lockedToken.decimals,
    );
    setToken({
      name: lockedToken.name,
      address: lockedToken.address,
      totalSupply,
      totalLocked: lockOrVesting.amount,
    });
  };

  const onCheckToggleHandl = () => {
    const theme = document.body.id;
    let found = false;
    if (theme === 'dark') {
      found = true;
    }
    return found;
  };

  useEffect(() => {
    // locker
    if (isLocker) {
      const lockerContract = new LockerContract(wallet.getWalletProvider());
      lockerContract.getLockByDepositId(id + 1).then(async (lock) => {
        setLocks([
          {
            ...lock,
            inProgress: false,
          },
        ]);

        await setLockedToken(lock);
      });
    } else {
      // vesting
      const vestingContract = new VestingContract(wallet.getWalletProvider());
      vestingContract.getVestingById(id).then(async (vesting) => {
        setLocks(
          vesting.percents.map((percent, index) => {
            return {
              id: index,
              token: {
                ...vesting.token,
              },
              withdrawalAddress: vesting.withdrawalAddress,
              amount: vesting.amount.multipliedBy(percent),
              lockDate: vesting.lockDate,
              unlockDate: vesting.unlockDates[index],
              withdrawn: !percent,
              inProgress: false,
            };
          }),
        );

        await setLockedToken(vesting);
      });
    }
  }, [id, isLocker, location, wallet, user.address]);

  const onClaim = (lockId: number) => {
    setLocks(
      locks.map((lock) => {
        if (lock.id === lockId) {
          return {
            ...lock,
            inProgress: true,
          };
        }
        return lock;
      }),
    );

    let withdrawPromise;
    if (isLocker) {
      const lockerContract = new LockerContract(wallet.getWalletProvider());
      withdrawPromise = lockerContract.withdrawTokens(lockId);
    } else {
      const vestingContract = new VestingContract(wallet.getWalletProvider());
      withdrawPromise = vestingContract.withdraw(id, lockId);
    }
    withdrawPromise
      .then(async (receipt) => {
        // eslint-disable-next-line no-console
        console.log('Success', receipt);
        setLocks(
          locks.map((lock) => {
            if (lock.id === lockId) {
              return {
                ...lock,
                withdrawn: true,
                inProgress: false,
              };
            }
            return lock;
          }),
        );
      })
      .catch((err) => {
        console.debug(err);
        setLocks(
          locks.map((lock) => {
            if (lock.id === lockId) {
              return {
                ...lock,
                inProgress: false,
              };
            }
            return lock;
          }),
        );
      });
  };

  BigNumber.config({ DECIMAL_PLACES: 100 });

  const roundNumber = (value: BigNumber): string => {
    const stringValue = value.toFixed();
    const [integerPart, decimalsPart] = stringValue.split('.');
    if (!decimalsPart) {
      return stringValue;
    }
    let newDecimalsPart;
    if (value.gt(1)) {
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

  const getImage = (imageName: string) => {
    if (imageName === 'WBNB.svg') {
      return WBNB;
    }
    if (imageName === 'CAKE.svg') {
      return CAKE;
    }
    if (imageName === 'BUSD.svg') {
      return BUSD;
    }
    if (imageName === 'C98.svg') {
      return C98;
    }
    if (imageName === 'AXS.svg') {
      return AXS;
    }
    if (imageName === 'SPS.svg') {
      return SPS;
    }
    return Unknown;
  };

  React.useEffect(() => {
    if (token.address && !token.checked) {
      const newToken = {
        ...token,
      };
      const foundLPToken = tokensLp.find(
        (t) => t.address.toLowerCase() === token.address.toLowerCase(),
      );
      if (foundLPToken) {
        newToken.imageFront = foundLPToken.token0.image;
        newToken.imageBack = foundLPToken.token1.image;
        newToken.name = `${foundLPToken.token0.symbol} / ${foundLPToken.token1.symbol}`;
      }
      const foundDefToken = tokensDefault.find(
        (t) => t.address.toLowerCase() === token.address.toLowerCase(),
      );
      if (foundDefToken) {
        newToken.image = foundDefToken.image;
      }
      newToken.checked = true;
      setToken(newToken);
    }
  }, [token, tokensLp, tokensDefault]);

  return (
    <div className="explorer">
      <div className="explorer_header">
        <Button className="explorer_header_btn" size="secondary" colorScheme="none" link="/">
          &#8592;
        </Button>
      </div>
      <div className="explorer_body">
        <div className="explorer_boxes">
          <div className="explorer_body_boxes_row">
            <Card
              icon={onCheckToggleHandl() ? LockBlack : LockWhite}
              className="explorer_body_boxes_row-locked"
            >
              <ReactTooltip />
              <span
                className="h1 text-yellow-white text-bold"
                data-tip={`${roundNumber(
                  new BigNumber(token.totalLocked).multipliedBy(100).div(token.totalSupply).dp(50),
                )}%`}
              >
                {token.totalLocked && token.totalSupply
                  ? `${new BigNumber(token.totalLocked)
                      .multipliedBy(100)
                      .div(token.totalSupply)
                      .toFixed(2)}%`
                  : null}
              </span>
              <span className="h3 text-white-black text-bold text-upper">Locked</span>
            </Card>
            {token?.imageBack && token?.imageFront ? (
              <div className="images-container">
                <Card
                  icon={getImage(token?.imageFront || '')}
                  icon2={getImage(token?.imageBack || '')}
                >
                  <span className="h1 text-yellow text-bold">{token.name}</span>
                  <span className="h4 text-white-black text-bold">{token.address}</span>
                </Card>
              </div>
            ) : (
              <Card icon={getImage(token?.image || '')}>
                <span className="h1 text-yellow text-bold">{token.name}</span>
                <span className="h4 text-white-black text-bold">{token.address}</span>
              </Card>
            )}
            <Card>
              <div className="explorer_body_boxes_row_buttons">
                <a
                  target="_blank"
                  href={`https://bscscan.com/address/${token.address}`}
                  rel="noreferrer"
                >
                  <Button
                    type="button"
                    colorScheme="yellow"
                    size="primary"
                    icon={ArrowRight}
                    className="explorer_body_boxes_row_buttons-btn"
                  >
                    BSCScan
                  </Button>
                </a>
                <a
                  target="_blank"
                  href={`https://pancakeswap.info/pair/${token.address}`}
                  rel="noreferrer"
                >
                  <Button
                    type="button"
                    colorScheme="yellow"
                    size="primary"
                    icon={ArrowRight}
                    className="explorer_body_boxes_row_buttons-btn"
                  >
                    Pancakeswap
                  </Button>
                </a>
              </div>
            </Card>
          </div>
          <div className="explorer_body_boxes_row">
            <Card>
              <span className="h1 text-yellow text-bold wrap-any">
                {token.totalSupply?.toFormat(0, BIG_NUMBER_FORMAT)}
              </span>
              <span className="h3 text-white-black text-bold">Total {token?.name}</span>
            </Card>
            <Card>
              <span className="h1 text-yellow text-bold wrap-any">
                {token.totalLocked?.toFormat(BIG_NUMBER_FORMAT)}
              </span>
              <span className="h3 text-white-black text-bold">Total locked {token?.name}</span>
            </Card>
          </div>
        </div>
        <div className="explorer_body_info">
          <Table locks={locks} onClaim={onClaim} />
        </div>
      </div>
    </div>
  );
});

export default Explorer;
