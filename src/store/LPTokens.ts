import { flow, types } from 'mobx-state-tree';

import { tokensApi } from '../services/api/index';

const LPTokenModel = types.model({
  address: types.string,
  name: types.string,
  symbol: types.string,
  decimals: types.union(types.number, types.string),
  token0: types.model({
    address: types.string,
    symbol: types.string,
    image: types.string,
  }),
  token1: types.model({
    address: types.string,
    symbol: types.string,
    image: types.string,
  }),
});

const LPTokensModel = types
  .model({
    default: types.optional(types.array(LPTokenModel), []),
  })
  .actions((self): any => {
    const getTokens = flow(function* getTokens(type: 'default') {
      try {
        let response: any = {};
        switch (type) {
          default:
            response = yield tokensApi.getLPTokens();
            break;
        }
        self[type] = response.data;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });
    const setTokens = (type: 'default', tokens: any) => {
      self[type] = tokens;
    };
    return {
      getTokens,
      setTokens,
    };
  });

export default LPTokensModel;
