import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';

import { WalletProvider } from '../wallets/wallet-provider/WalletProvider';

import ERC20_TOKEN_ABI from './abi/ERC20_TOKEN_ABI';
import { Web3Public } from './web3-public';

export class Web3Private {
  private readonly web3: Web3;

  constructor(private readonly walletProvider: WalletProvider) {
    this.web3 = this.walletProvider.getWeb3();
  }

  public async approveToken(
    token: { address: string; decimals: number },
    spenderAddress: string,
    amount: string | number,
    value: number | 'infinity',
  ): Promise<void> {
    let valueAbsolute: BigNumber;
    if (value === 'infinity') {
      valueAbsolute = new BigNumber(2).pow(256).minus(1);
    } else {
      valueAbsolute = Web3Public.toWei(value, token.decimals);
    }
    const amountAbsolute = Web3Public.toWei(amount, token.decimals);
    const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, token.address);
    const userAddress = await this.walletProvider.getAddress();

    const allowance = await contract.methods.allowance(userAddress, spenderAddress).call();
    if (new BigNumber(allowance).lt(amountAbsolute)) {
      await contract.methods.approve(spenderAddress, valueAbsolute.toFixed(0)).send({
        from: await this.walletProvider.getAddress(),
      });
    }
  }

  public async executeContractMethod(
    contractAddress: string,
    contractAbi: AbiItem[],
    methodName: string,
    methodArguments: unknown[],
    value = '0',
  ): Promise<TransactionReceipt> {
    const contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    return contract.methods[methodName](...methodArguments).send({
      from: await this.walletProvider.getAddress(),
      value,
    });
  }
}
