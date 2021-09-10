import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Menu } from 'antd';

import 'antd/lib/dropdown/style/css';

import AboutWhite from '../../../assets/img/about-w.svg';
import AboutBlack from '../../../assets/img/about.svg';
import Arrow from '../../../assets/img/arrow-right.svg';
import AuditWhite from '../../../assets/img/audit-w.svg';
import AuditBlack from '../../../assets/img/audit.svg';
import CloseMenu from '../../../assets/img/burger-close.svg';
import OpenMenu from '../../../assets/img/burger-open.svg';
import DarkMode from '../../../assets/img/dark-mode.svg';
import LightMode from '../../../assets/img/light-mode-w.svg';
import LitepaperWhite from '../../../assets/img/litepaper-w.svg';
import LitepaperBlack from '../../../assets/img/litepaper.svg';
import PlockWhite from '../../../assets/img/plock-dex-w.svg';
import PlockBlack from '../../../assets/img/plock-dex.svg';
import SafuWhite from '../../../assets/img/safu-tokens-w.svg';
import SafuBlack from '../../../assets/img/safu-tokens.svg';
import Stake from '../../../assets/img/staking-menu.svg';
import StakeBlack from '../../../assets/img/staking-menu-bl.svg';
import Button from '../../atoms/Button';
import { CreateLock, EnterAddress, ProjectNotCertified } from '../../organisms';

import './MobileMenu.scss';

interface IDropDowmMobilProps {
  onToggleThemeHandl: () => void;
  darkTheme: boolean;
  onChangeWalletModalHandl: (param: boolean) => void;
}

const MobileMenu: React.FC<IDropDowmMobilProps> = ({
  onToggleThemeHandl,
  darkTheme,
  onChangeWalletModalHandl,
}) => {
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [isCreateLk, setCreateLk] = React.useState(false);
  const [isEnterAdr, setEnterAdr] = React.useState(false);
  const [isProjectNotCertified, setProjectNotCertified] = React.useState(false);

  const onChangeModalMenuHandl = () => {
    setMenuOpen((prev) => !prev);
  };

  const onOpenCreateLock = () => {
    setCreateLk(true);
  };

  const menu = (
    <Menu className="dropDown" onClick={onChangeModalMenuHandl}>
      <Menu.Item key="0">
        <Button
          type="button"
          size="secondary"
          colorScheme="yellow"
          icon={Arrow}
          className="mobile-menu_rows-btn"
          onClick={onChangeWalletModalHandl}
        >
          Connect Wallet
        </Button>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="https://doc.pancakelock.finance/" target="_blank" rel="noreferrer">
          <img src={!darkTheme ? AboutBlack : AboutWhite} alt="about" className="dropDown_icon" />
          <span className="text-white-black">About</span>
        </a>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="/sources/Litepaper.pdf" target="_blank" rel="noreferrer">
          <img
            src={!darkTheme ? LitepaperBlack : LitepaperWhite}
            alt="litepaper"
            className="dropDown_icon"
          />
          <span className="text-white-black">Litepaper</span>
        </a>
      </Menu.Item>
      <Menu.Item key="3">
        <a
          href="https://drive.google.com/file/d/1UtyPbzwnXdyLwZmc2C8n7d7Fv7e5I3IX/view"
          target="_blank"
          rel="noreferrer"
        >
          <img src={!darkTheme ? AuditBlack : AuditWhite} alt="audit" className="dropDown_icon" />
          <span className="text-white-black">Audit</span>
        </a>
      </Menu.Item>
      <Menu.Item key="4">
        <Link to="/">
          <img src={!darkTheme ? SafuBlack : SafuWhite} alt="safu" className="dropDown_icon" />
          <span className="text-white-black">Safu Tokens</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="5">
        <a
          href="https://pancakeswap.finance/swap#/swap?inputCurrency=BNB&outputCurrency=0xCE0f314013Dc814F2da9d58160C54231fb2dDae2"
          target="_blank"
          rel="noreferrer"
        >
          <img src={!darkTheme ? PlockBlack : PlockWhite} alt="plock" className="dropDown_icon" />
          <span className="text-white-black">Trade PLOCK</span>
        </a>
      </Menu.Item>
      <Menu.Item key="6">
        <a href="https://pancakelock.finance/stake" target="_blank" rel="noreferrer">
          <img
            src={!darkTheme ? Stake : StakeBlack}
            alt="stake"
            className="dropDown_icon"
            style={{ width: '17px', height: '17px' }}
          />
          <span className="text-white-black">Staking</span>
        </a>
      </Menu.Item>
      <Menu.Item key="7">
        <Button
          type="button"
          size="img"
          colorScheme="none"
          onClick={() => onToggleThemeHandl()}
          className="dropDown_theme-btn"
        >
          <span className="dropDown_theme-text text-white-black">
            <img src={!darkTheme ? DarkMode : LightMode} alt="theme" className="dropDown_icon" />
            {darkTheme ? 'White Mode' : 'Dark Mode'}
          </span>
        </Button>
      </Menu.Item>
      <Menu.Item key="8">
        <Button size="secondary" className="drop-btn" onClick={onOpenCreateLock}>
          Safu lock
        </Button>
      </Menu.Item>
      <Menu.Item key="8">
        <Button size="secondary" className="drop-btn" link="/vesting">
          Vesting
        </Button>
      </Menu.Item>
    </Menu>
  );

  React.useEffect(() => {
    return () => {
      setMenuOpen(false);
    };
  }, []);

  return (
    <>
      {isCreateLk ? (
        <CreateLock handleChangeOpen={setCreateLk} handleShowNext={setEnterAdr} />
      ) : null}
      {isEnterAdr ? (
        <EnterAddress handleChangeOpen={setEnterAdr} handleShowNext={setProjectNotCertified} />
      ) : null}
      {isProjectNotCertified ? (
        <ProjectNotCertified handleChangeOpen={setProjectNotCertified} />
      ) : null}
      <Dropdown
        overlayClassName="dropDown"
        overlay={menu}
        trigger={['click']}
        visible={isMenuOpen}
        onVisibleChange={onChangeModalMenuHandl}
      >
        <Button
          // onClick={onChangeModalMenuHandl}
          // onBlur={() => setMenuOpen(false)}
          size="img"
          icon={isMenuOpen ? CloseMenu : OpenMenu}
          colorScheme="none"
          className="burger_open"
        />
      </Dropdown>
    </>
  );
};
export default MobileMenu;
