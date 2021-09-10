import React from 'react';
import { valueType } from 'antd/es/statistic/utils';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';

import ArrowSelect from '../../../../assets/img/arrow-select.svg';
import AXS from '../../../../assets/img/tokens/AXS.svg';
import BUSD from '../../../../assets/img/tokens/BUSD.svg';
import C98 from '../../../../assets/img/tokens/C98.svg';
import CAKE from '../../../../assets/img/tokens/CAKE.svg';
import SPS from '../../../../assets/img/tokens/SPS.svg';
import Unknown from '../../../../assets/img/tokens/unknow.svg';
import WBNB from '../../../../assets/img/tokens/WBNB.svg';
import { useMst } from '../../../../store';
import { ILPToken, IToken } from '../../../../types';
import { Button, InputNumber } from '../../../atoms';
import { SelectTokens } from '../../../organisms';

import './Tokens.scss';

interface ITokensAmount {
  tokenAmount: valueType;
  onChangeAmountDataHandl: (amount: valueType) => void;
  onSetToken?: (params: IToken) => void;
  usersBalance: string;
  type: 'configure' | 'vesting';
}

export interface ITokenName {
  name: string;
  symbol: string;
}

export function getImage(imageName: string | undefined): string {
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
}

const Tokens: React.FC<ITokensAmount> = observer(
  ({ usersBalance, onChangeAmountDataHandl, onSetToken, tokenAmount, type }) => {
    const { token, tokens, lpTokens, user } = useMst();
    const [value, setValue] = React.useState<valueType>('');
    const [modalTokens, setShowModalToken] = React.useState(false);
    const [selectedToken, setSelectedToken] = React.useState<IToken | undefined>();
    const [tokensList, setTokensList] = React.useState<(IToken | ILPToken)[]>(
      lpTokens.default.concat(tokens.default),
    );

    const onSetTokensAmount = (event: valueType) => {
      if (+event >= 0) {
        setValue(+event);
        onChangeAmountDataHandl(+event);
      } else {
        setValue(0);
      }
    };

    const onSetMaxAmountHandl = () => {
      onSetTokensAmount(usersBalance);
    };

    function instanceOfLP(object: any): object is ILPToken {
      return 'token0' in object;
    }

    const onChangeTokenHandl = (selToken: ILPToken | IToken) => {
      const newSelectedToken = {
        ...selToken,
      };
      if (instanceOfLP(selToken)) {
        newSelectedToken.imageFront = getImage(selToken.token0.image);
        newSelectedToken.imageBack = getImage(selToken.token1.image);
        newSelectedToken.name = `${selToken.token0.symbol}-${selToken.token1.symbol}`;
        setSelectedToken(newSelectedToken);
        if (onSetToken) {
          onSetToken({
            name: selToken.name,
            symbol: selToken.symbol,
            decimals: selToken.decimals,
            imageFront: newSelectedToken.imageFront,
            imageBack: newSelectedToken.imageBack,
            address: selToken.address,
          });
        }
      } else {
        newSelectedToken.image = getImage(selToken.image || '');
        setSelectedToken(newSelectedToken);
        if (onSetToken) {
          onSetToken(newSelectedToken);
        }
      }
    };

    React.useEffect(() => {
      setValue(tokenAmount);
    }, [tokenAmount]);

    React.useEffect(() => {
      if (lpTokens.default.length || tokens.default.length) {
        setTokensList(lpTokens.default.concat(tokens.default));
      }
    }, [lpTokens.default, lpTokens.default.length, tokens.default, tokens.default.length]);

    React.useEffect(() => {
      if (token.address && type === 'configure') {
        const newSelectedToken = {
          ...token,
        };

        const foundToken = tokensList.find(
          (lpToken: IToken) => lpToken.address.toLowerCase() === token.address.toLowerCase(),
        );
        if (foundToken && instanceOfLP(foundToken)) {
          const foundLPToken = tokens.default.find(
            (lpToken: IToken) => lpToken.address.toLowerCase() === token.address.toLowerCase(),
          );
          newSelectedToken.imageFront = foundLPToken.token0.image;
          newSelectedToken.imageBack = foundLPToken.token1.image;
          newSelectedToken.name = `${foundLPToken.token0.symbol}-${foundLPToken.token1.symbol}`;
        } else {
          const foundTokenDefault = tokens.default.find(
            (tokenDefault: IToken) =>
              tokenDefault.address.toLowerCase() === token.address.toLowerCase(),
          );
          if (foundTokenDefault) {
            newSelectedToken.image = foundTokenDefault.image;
          }
        }

        onChangeTokenHandl(newSelectedToken);
      } else if (tokensList.length) {
        const whitelistedToken = {
          ...tokensList[0],
        };
        const newSelectedToken = whitelistedToken;
        if (instanceOfLP(whitelistedToken)) {
          newSelectedToken.imageFront = whitelistedToken.token0.image;
          newSelectedToken.imageBack = whitelistedToken.token1.image;
          newSelectedToken.name = `${whitelistedToken.token0.symbol}-${whitelistedToken.token1.symbol}`;
        } else {
          newSelectedToken.image = whitelistedToken.image;
        }

        onChangeTokenHandl(newSelectedToken);
      }
      // eslint-disable-next-line
    }, [
      tokensList,
      tokensList.length,
      lpTokens,
      lpTokens.default,
      lpTokens.default.length,
      token,
      tokens.default,
      tokens.default.length,
    ]);

    return (
      <div className="tokens">
        {modalTokens ? (
          <SelectTokens
            type={type}
            onChangeTokenHandl={onChangeTokenHandl}
            handleChangeOpen={setShowModalToken}
          />
        ) : null}
        <div className="tokens-left">
          <button type="button" className="tokens-left_btn" onClick={() => setShowModalToken(true)}>
            {selectedToken?.imageFront && selectedToken?.imageBack ? (
              <div className="tokens-left_btn_icon-container">
                <img
                  src={selectedToken.imageFront}
                  alt="icon"
                  className="tokens-left_btn_icon-container_front"
                />
                <img
                  src={selectedToken.imageBack}
                  alt="icon"
                  className="tokens-left_btn_icon-container_back"
                />
              </div>
            ) : (
              <img
                src={selectedToken?.image || Unknown}
                alt="icon"
                className="tokens-left_btn_icon"
              />
            )}
            <span>{selectedToken ? selectedToken.name : 'Loading...'}</span>
            <img src={ArrowSelect} alt="icon" className="tokens-left_btn_arrow" />
          </button>

          {user.address && selectedToken ? (
            <div className="tokens-left_balance">
              {usersBalance ? (
                <>
                  <span className="tokens-left_balance-text">
                    Your balance:{' '}
                    <span
                      className={cn({
                        'tokens-left_balance-text-zero': +usersBalance === 0,
                      })}
                    >
                      ${usersBalance}
                    </span>{' '}
                    {selectedToken.symbol}
                  </span>
                </>
              ) : (
                <span className="tokens-left_balance-text">Loading...</span>
              )}
            </div>
          ) : null}
        </div>
        <div className="tokens-right">
          <InputNumber
            type="number"
            isValid={value === 0}
            value={value}
            onChange={(event) => onSetTokensAmount(event)}
            colorScheme="outline"
            placeholder="0"
            className="tokens-right_value"
          />
          <Button
            type="button"
            size="img"
            colorScheme="none"
            className={cn('tokens-right-maxbtn', {
              'tokens-right-maxbtn-off': +usersBalance === 0,
            })}
            onClick={onSetMaxAmountHandl}
          >
            MAX
          </Button>
        </div>
      </div>
    );
  },
);

export default Tokens;
