import { localApi } from '../../../core/axios';

export default {
  getDefaultTokens: (): any => localApi.get('default-tokens.json'),
  getLPTokens: (): any => localApi.get('LP-tokens.json'),
};
