import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import ERC20_TOKEN_ABI from './abi/ERC20_TOKEN_ABI';

type TokenField = 'name' | 'symbol' | 'decimals' | 'totalSupply' | 'token0' | 'token1';

type TokenInfo = Partial<
  {
    [field in TokenField]: any;
  }
>;

export class Web3Public {
  private readonly web3: Web3;

  constructor() {
    // this.web3 = new Web3('https://data-seed-prebsc-2-s1.binance.org:8545/');
    this.web3 = new Web3('https://bsc-dataseed.binance.org/');
  }

  public static toWei(amount: number | string | BigNumber, decimals = 18): BigNumber {
    return new BigNumber(amount).multipliedBy(10 ** decimals);
  }

  public static fromWei(amount: number | string | BigNumber, decimals = 18): BigNumber {
    return new BigNumber(amount).dividedBy(10 ** decimals);
  }

  public async callContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: any[] = [],
  ): Promise<any> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    return contract.methods[methodName](...methodArguments).call();
  }

  public async getTokenInfo(tokenAddress: string, fields: TokenField[]): Promise<TokenInfo> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);
    const fieldsPromises = fields.map((field) => contract.methods[field]().call());
    const fieldsValues = await Promise.all(fieldsPromises);
    return fields.reduce(
      (acc, field, index) => ({
        ...acc,
        [field]: fieldsValues[index],
      }),
      {},
    );
  }

  public async getBalanceOf(tokenAddress: string, ownerAddress: string): Promise<BigNumber> {
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);
    return new BigNumber(await contract.methods.balanceOf(ownerAddress).call());
  }
}
