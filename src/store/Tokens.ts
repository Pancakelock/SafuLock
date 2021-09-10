import { flow, types } from 'mobx-state-tree';

import { tokensApi } from '../services/api/index';

const TokenModel = types.model({
  name: types.string,
  symbol: types.string,
  address: types.string,
  // chainId: types.optional(types.number, 56),
  decimals: types.union(types.number, types.string),
  image: types.optional(types.string, ''),
});

const TokensModel = types
  .model({
    default: types.optional(types.array(TokenModel), []),
  })
  .actions((self): any => {
    const getTokens = flow(function* getTokens(type: 'default') {
      try {
        let response: any = {};
        switch (type) {
          default:
            response = yield tokensApi.getDefaultTokens();
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

export default TokensModel;
