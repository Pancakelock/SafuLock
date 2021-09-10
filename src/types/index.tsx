import { ILock } from '../services/blockchain/contracts/types/ILock';

export interface ICreateLkProps {
  handleChangeOpen: (param: boolean) => void;
  handleShowNext: (param: boolean) => void;
}

export interface IEnterAddressProps {
  handleChangeOpen: (param: boolean) => void;
  handleShowNext: (param: boolean) => void;
}

export interface IAuthFormProps {
  handleChangeOpen: (param: boolean) => void;
  handleShowNext: (param: boolean) => void;
}

export interface IConnectWlProps {
  onChangeWalletModalHandl: (param: boolean) => void;
  darkTheme?: boolean;
}

export interface IModalProps {
  handleChangeOpen: (params: boolean) => void;
}

export interface ICloseModal {
  onClose: (event: React.MouseEvent) => void;
}

export interface IVestingInput {
  onSetInputValueHandl: (itemId: number, field: string, value: number) => void;
}

export interface IVestingDate {
  onSetDateHandl: (itemId: number, field: string, value: Date) => void;
}

export interface IVestingProps extends IVestingInput, IVestingDate {}

export interface IExplorerTableLock extends ILock {
  inProgress: boolean;
}

export type WalletProviderName = 'metamask' | 'walletconnect';

export interface IToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image?: string;
  imageBack?: string;
  imageFront?: string;
}

export interface ILPToken extends IToken {
  token0: {
    address: string;
    symbol: string;
    image: string;
  };
  token1: {
    address: string;
    symbol: string;
    image: string;
  };
}
