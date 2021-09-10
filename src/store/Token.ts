import { types } from 'mobx-state-tree';

import { IToken } from '../types';

const TokenModel = types
  .model({
    address: types.maybe(types.string),
    name: types.maybe(types.string),
    symbol: types.maybe(types.string),
    decimals: types.maybe(types.number),
  })
  .actions((self) => ({
    setToken(token: IToken) {
      self.address = token.address;
      self.name = token.name;
      self.symbol = token.symbol;
      self.decimals = token.decimals;
    },
  }));

export default TokenModel;
