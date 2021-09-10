import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Footer, Header } from './components/organisms';
import Configure from './pages/Configure';
import { Explorer, Main, Vesting } from './pages';
import { useMst } from './store';

export const App: React.FC = observer(() => {
  const mountedRef = React.useRef(true);

  const { tokens, lpTokens } = useMst();

  const [themeColor, setThemeColor] = React.useState(false);

  React.useEffect(() => {
    tokens.getTokens('default');
    lpTokens.getTokens('default');
    return () => {
      mountedRef.current = false;
    };
  }, [lpTokens, tokens]);

  return (
    <div className="pancakelock">
      <Header onChangeThemeColorHandl={setThemeColor} />
      <Switch>
        <Route path="/" exact component={Main} />
        <Route path="/configure" component={Configure} />
        <Route path="/explorer/locker/:id" exact component={Explorer} />
        <Route path="/explorer/vesting/:id" exact component={Explorer} />
        <Route path="/vesting" exact component={Vesting} />
      </Switch>
      <Footer themeColor={themeColor} />
    </div>
  );
});
