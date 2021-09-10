import React from 'react';

import GithubBlack from '../../../assets/img/github-b.svg';
import GithubWhite from '../../../assets/img/github-w.svg';
import MbtnBlack from '../../../assets/img/mbtn-b.svg';
import MbtnWhite from '../../../assets/img/mbtn-w.svg';
import TelegramBlack from '../../../assets/img/telegram-b.svg';
import TelegramWhite from '../../../assets/img/telegram-w.svg';
import TwitterBlack from '../../../assets/img/twitter-b.svg';
import TwitterWhite from '../../../assets/img/twitter-w.svg';

import './Footer.scss';

interface IFooter {
  themeColor: boolean;
}

const Footer: React.FC<IFooter> = ({ themeColor }) => {
  const [isDark, setDarkTheme] = React.useState(themeColor);

  React.useEffect(() => {
    if (themeColor) {
      setDarkTheme(true);
    } else setDarkTheme(false);
  }, [themeColor]);

  return (
    <div className="footer">
      <div className="footer-links">
        <span>
          <a href="https://twitter.com/pancakelock" aria-label="twitter">
            <img src={isDark ? TwitterBlack : TwitterWhite} alt="twitter" />
          </a>
        </span>
        <span>
          <a href="https://github.com/Pancakelock" aria-label="github">
            <img src={isDark ? GithubBlack : GithubWhite} alt="github" />
          </a>
        </span>
        <span>
          <a href="https://pancakelock.medium.com/" aria-label="medium">
            <img src={isDark ? MbtnBlack : MbtnWhite} alt="medium" />
          </a>
        </span>
        <span>
          <a href="https://t.me/Pancakelock" aria-label="telegram">
            <img src={isDark ? TelegramBlack : TelegramWhite} alt="telegram" />
          </a>
        </span>
      </div>
      <span className="h2 text-gray-const footer-text">
        Copyright © 2021 Pancakelock. LLC. All rights reserved
      </span>
    </div>
  );
};

export default Footer;
