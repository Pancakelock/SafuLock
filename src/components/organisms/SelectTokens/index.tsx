import React from 'react';

import Close from '../../../assets/img/close.svg';
import { useMst } from '../../../store';
import { ILPToken, IToken } from '../../../types';
import { Button } from '../../atoms';
import Search from '../../atoms/Search';
import { getImage } from '../../sections/Configure/Tokens';

import './SelectTokens.scss';

interface ISelectModal {
  onChangeTokenHandl: (token: ILPToken | IToken) => void;
  handleChangeOpen: (params: boolean) => void;
  type: 'configure' | 'vesting';
}

const SelectTokens: React.FC<ISelectModal> = ({ handleChangeOpen, onChangeTokenHandl, type }) => {
  const { lpTokens, tokens, token } = useMst();
  const [tokensData, setTokensData] = React.useState<(ILPToken | IToken)[]>([]);
  const [notFound, setNotFound] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  const onCloseModal = () => {
    handleChangeOpen(false);
  };

  const onSelectTokenHandl = (selectedToken: ILPToken | IToken) => {
    onChangeTokenHandl(selectedToken);
    handleChangeOpen(false);
  };

  const onSearchTokenHandl = (event: string | number) => {
    let searchingData = [];
    const tokensList = tokens.default.concat(lpTokens.default);
    const alreadyHave = tokensList.find(
      (t: ILPToken | IToken) => t.address.toLowerCase() === token.address?.toLowerCase(),
    );
    if (token.address && !alreadyHave && type === 'configure') {
      searchingData = [token, ...tokensList];
    } else {
      searchingData = tokens.default.concat(lpTokens.default);
    }

    if (event === '') {
      setTokensData(searchingData);
      setNotFound(false);
    } else {
      const newData = searchingData.filter(
        (t: IToken) =>
          t.name.toLowerCase().includes(event.toString().toLowerCase()) ||
          t.symbol.toLowerCase().includes(event.toString().toLowerCase()) ||
          t.address.toLowerCase().includes(event.toString().toLowerCase()),
      );
      if (newData.length > 0) {
        setTokensData(newData);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    }
  };

  function instanceOfLP(object: any): object is ILPToken {
    return 'token0' in object;
  }

  React.useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      const tokensList = tokens.default.concat(...lpTokens.default);
      const alreadyHave = tokensList.find(
        (t: ILPToken | IToken) => t.address.toLowerCase() === token.address?.toLowerCase(),
      );
      if (token.address && !alreadyHave && type === 'configure') {
        setTokensData([token, ...tokensList]);
      } else {
        setTokensData(tokens.default.concat(...lpTokens.default));
      }
    }
  }, [
    isLoaded,
    token,
    lpTokens.default,
    lpTokens.default.length,
    tokens.default,
    tokens.default.length,
    type,
  ]);

  return (
    <>
      <div className="select_overlay" onClick={onCloseModal} role="presentation" />
      <div className="select_content">
        <Button
          icon={Close}
          close
          size="close"
          colorScheme="none"
          onClick={onCloseModal}
          className="select_content_btn"
        />
        <h1 className="text-yellow text-bold text-center">Select a token</h1>
        <Search
          realtime
          placeholder="Search"
          className="select_content_search"
          onChange={(event) => onSearchTokenHandl(event)}
        />
        {notFound ? (
          <span className="h2 text-white-black text-center">Not Found</span>
        ) : (
          <>
            {!tokensData.length ? (
              'Loading...'
            ) : (
              <div className="select_content_items ">
                {tokensData.map((lptoken: ILPToken | IToken) => {
                  return (
                    <div
                      className="select_content_items_i"
                      key={Math.random()}
                      onClick={() => onSelectTokenHandl(lptoken)}
                      onKeyDown={() => onSelectTokenHandl(lptoken)}
                      role="presentation"
                    >
                      {instanceOfLP(lptoken) ? (
                        <div className="select_content_items_i-left">
                          <img
                            src={getImage(lptoken.token0.image)}
                            alt="icon"
                            className="select_content_items_i-left_icon-front"
                          />
                          <img
                            src={getImage(lptoken.token1.image)}
                            alt="icon"
                            className="select_content_items_i-left_icon-back"
                          />
                        </div>
                      ) : (
                        <div className="select_content_items_i-left">
                          <img
                            src={getImage(lptoken.image)}
                            alt="icon"
                            className="select_content_items_i-left_icon-def"
                          />
                        </div>
                      )}

                      <div className="select_content_items_i-right">
                        <span className="select_content_items_i-right_name">
                          {instanceOfLP(lptoken)
                            ? `${lptoken.token0.symbol}-${lptoken.token1.symbol}`
                            : lptoken.name}
                        </span>
                        <span className="select_content_items_i-right_symbol">
                          {lptoken.symbol}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
export default SelectTokens;
