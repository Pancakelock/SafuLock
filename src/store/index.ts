import { createContext, useContext } from 'react';
import { Instance, types } from 'mobx-state-tree';

import LPTokensModel from './LPTokens';
import TokenModel from './Token';
import TokensModel from './Tokens';
import UserModel from './User';

const RootModel = types.model({
  user: UserModel,
  tokens: TokensModel,
  lpTokens: LPTokensModel,
  token: TokenModel,
});

export const Store = RootModel.create({
  tokens: {
    default: [],
  },
  lpTokens: {
    default: [],
  },
  user: {
    address: '',
  },
  token: {},
  // token:   {
  //   address: "0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb",
  //   name: "SafePal Token",
  //   symbol: "SFP",
  //   decimals: 18,
  // },
});

const rootStore = Store;

// onSnapshot(rootStore, (snapshot) => {
//   console.log('Snapshot:', snapshot);
// });

export type RootInstance = Instance<typeof RootModel>;

const RootStoreContext = createContext<null | RootInstance>(null);

export const { Provider } = RootStoreContext;

export function useMst(): any {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw Error('Store cannot be null, please add a context provider');
  }

  return store;
}

export default rootStore;
