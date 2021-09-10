import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import Arrow from '../../../assets/img/arrow-right.svg';
// import LogoDark from '../../../assets/img/logo-dark-mode.svg';
import Logo from '../../../assets/img/logo.svg';
// import LogoWhite from '../../../assets/img/logo-white-mode.svg';
import { useMst } from '../../../store';
import Button from '../../atoms/Button';
import { DesktopMenu, MobileMenu } from '../../molecules';
import { ConnectWallet, DisconnectWallet } from '../index';

import './Header.scss';

interface IHeader {
  onChangeThemeColorHandl: (params: boolean) => void;
}

const Header: React.FC<IHeader> = observer(({ onChangeThemeColorHandl }) => {
  const [isWalletOpen, setIsWalletOpen] = React.useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = React.useState(false);
  const [isDarkTheme, setDarkTheme] = React.useState(false);

  const { user } = useMst();

  const onToggleThemeHandl = () => {
    setDarkTheme((prev) => !prev);
    if (!isDarkTheme) {
      document.body.id = 'dark';
      localStorage.setItem('THEME', 'DARK');
      onChangeThemeColorHandl(true);
    } else {
      document.body.id = '';
      localStorage.setItem('THEME', 'WHITE');
      onChangeThemeColorHandl(false);
    }
  };

  const onChangeWalletModalHandl = () => {
    if (isWalletOpen) {
      setIsWalletOpen(false);
    } else if (isDisconnectOpen) {
      setIsDisconnectOpen(false);
    } else if (!user.address) {
      setIsWalletOpen(true);
    } else {
      setIsDisconnectOpen(true);
    }
  };

  React.useEffect(() => {
    const actualTheme = localStorage.getItem('THEME');
    if (actualTheme === 'DARK') {
      setDarkTheme(true);
      onChangeThemeColorHandl(true);
      document.body.id = 'dark';
    } else {
      setDarkTheme(false);
      onChangeThemeColorHandl(false);
    }
  }, [isDarkTheme, onChangeThemeColorHandl]);

  return (
    <>
      <div className="header">
        {isWalletOpen ? (
          <ConnectWallet onChangeWalletModalHandl={onChangeWalletModalHandl} />
        ) : null}
        {isDisconnectOpen ? (
          <DisconnectWallet
            onChangeWalletModalHandl={onChangeWalletModalHandl}
            darkTheme={isDarkTheme}
          />
        ) : null}
        <div className="header_items box-r-sb">
          <div className="header_items_logo">
            <Link to="/">
              <img src={Logo} alt="logo" style={{ width: '200px' }} />
            </Link>
          </div>

          <div className="header_items_controls-mobile">
            <MobileMenu
              onToggleThemeHandl={onToggleThemeHandl}
              darkTheme={isDarkTheme}
              onChangeWalletModalHandl={onChangeWalletModalHandl}
            />
          </div>
          <div className="header_items_controls-desktop">
            <ul className="box-r-sb">
              <li>
                <DesktopMenu onToggleThemeHandl={onToggleThemeHandl} darkTheme={isDarkTheme} />
              </li>
              <li>
                <Button
                  className="header_items_controls_user-address"
                  type="button"
                  size="secondary"
                  colorScheme="yellow"
                  icon={Arrow}
                  onClick={onChangeWalletModalHandl}
                >
                  {user.address
                    ? `${user.address.substr(0, 6)}...${user.address.substr(
                        user.address.length - 4,
                        4,
                      )}`
                    : 'Connect Wallet'}
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
});

export default Header;
