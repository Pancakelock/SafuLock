import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import WalletConnector from './services/blockchain/wallets/WalletConnector';
import { App } from './App';
import rootStore, { Provider } from './store';

import './styles/index.scss';

ReactDOM.render(
  <Provider value={rootStore}>
    <Router>
      <WalletConnector>
        <App />
      </WalletConnector>
    </Router>
  </Provider>,

  document.getElementById('root'),
);
