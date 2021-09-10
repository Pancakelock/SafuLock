import React from 'react';

import LockB from '../../assets/img/lock-card-b.svg';
import LockW from '../../assets/img/lock-card-w.svg';
import ProjectB from '../../assets/img/project-card-b.svg';
import ProjectW from '../../assets/img/project-card-w.svg';
import TokensB from '../../assets/img/tokens-card-b.svg';
import TokensW from '../../assets/img/tokens-card-w.svg';
import VestingB from '../../assets/img/vesting-card-b.svg';
import VestingW from '../../assets/img/vesting-card-w.svg';
import { ActiveTable, Card } from '../../components/sections/Main';

import './Main.scss';

const Main: React.FC = () => {
  const [totalLp, setTotalLp] = React.useState<string>('0');
  const [totalVS, setTotalVS] = React.useState<string>('0');
  const [amountProject, setAmountProject] = React.useState<number>(0);
  const [amountTokens, setAmountTokens] = React.useState<number>(0);

  const onCheckToggleHandl = () => {
    const theme = document.body.id;
    let found = false;
    if (theme === 'dark') {
      found = true;
    }
    return found;
  };

  const cardsData = [
    {
      id: 0,
      title: 'TOTAL LOCKED TOKENS ON THE PLATFORM',
      value: `${totalLp}`,
      image: !onCheckToggleHandl() ? LockW : LockB,
    },
    {
      id: 1,
      title: 'TOTAL VESTING TOKENS ON THE PLATFORM',
      value: `${totalVS}`,
      image: !onCheckToggleHandl() ? VestingW : VestingB,
    },
    {
      id: 2,
      title: 'PROJECTS LOCKED',
      value: `${amountProject}`,
      image: !onCheckToggleHandl() ? ProjectW : ProjectB,
    },
    {
      id: 3,
      title: 'TOKENS LOCKED',
      value: `${amountTokens}`,
      image: !onCheckToggleHandl() ? TokensW : TokensB,
    },
  ];

  return (
    <div className="main box-c-c">
      <div className="main_title text-center">
        <h1 className="h1 text-yellow text-bold">Pancakelock</h1>
        <span className="h3 text-white text-bold">
          A Trusted and Safu Liquidity locker for the Community
        </span>
      </div>
      <div className="main_info">
        <ActiveTable
          // amountProject={amountProject}
          onChangeLPHandl={setTotalLp}
          onChangeVsHandl={setTotalVS}
          onChangeProjAmount={setAmountProject}
          onChangeTokensAmount={setAmountTokens}
        />
        <div className="main_cards">
          {cardsData.map((card) => (
            <Card key={card.id} title={card.title} value={card.value} image={card.image} />
          ))}
        </div>
        {/* <Graph /> */}
      </div>
    </div>
  );
};

export default Main;
