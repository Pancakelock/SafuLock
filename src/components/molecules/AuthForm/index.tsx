import React from 'react';
import { useHistory } from 'react-router-dom';
import { Form as AntdForm, Input as AntdInput } from 'antd';

// import { send } from 'emailjs-com';
import 'antd/lib/form/style/css';
import 'antd/lib/input/style/css';

import ArrowGray from '../../../assets/img/arrow-gray.svg';
import Arrow from '../../../assets/img/arrow-right.svg';
import { Web3Public } from '../../../services/blockchain/web3/web3-public';
import rootStore from '../../../store';
import { IAuthFormProps } from '../../../types';
import { Button } from '../../atoms';

import './AuthForm.scss';

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
  types: {
    email: 'It is not a valid email!',
  },
};

const AuthForm: React.FC<IAuthFormProps> = ({ handleChangeOpen }) => {
  const history = useHistory();
  const [tokenAddress, setTokenAddress] = React.useState('');
  // const [email, setEmail] = React.useState('');
  // const [toSend, setToSend] = React.useState<any>({
  //   from_name: '',
  //   to_name: '',
  //   message: '',
  //   reply_to: '',
  // });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [tokenValidateStatus, setTokenValidateStatus] = React.useState<'error' | ''>('');

  const tokenAddressRegex = /^0x[A-Za-z0-9]{40}$/;

  // function validateEmail(params: string) {
  //   const re =
  //     // eslint-disable-next-line
  //     /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   return re.test(params);
  // }

  function isButtonDisabled(): boolean {
    return !tokenAddressRegex.test(tokenAddress);
    // || !validateEmail(email);
  }

  const onSetAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    setTokenAddress(address);
    if (!tokenAddressRegex.test(address)) {
      setTokenValidateStatus('error');
    } else {
      setTokenValidateStatus('');
    }
  };

  // const onSetEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setEmail(event.target.value);
  //   if (validateEmail(event.target.value)) {
  //     setToSend({
  //       from_name: event.target.value,
  //       to_name: 'PANCAKELOCK',
  //       message: tokenAddress,
  //       reply_to: '',
  //     });
  //   }
  // };

  const onSubmitFormHandl = () => {
    setIsLoading(true);
    new Web3Public()
      .getTokenInfo(tokenAddress, ['name', 'symbol', 'decimals'])
      .then((tokenInfo) => {
        rootStore.token.setToken({
          address: tokenAddress,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          decimals: +tokenInfo.decimals,
        });
        // send('service_1k5bpcl', 'template_5rbs4ld', toSend, 'user_BFdKavi7uqagqrsATljSK')
        //   .then((response) => {
        //     // eslint-disable-next-line no-console
        //     console.log('SUCCESS!', response.status, response.text);
        //     // handleShowNext(true);
        //   })
        //   .catch((err) => {
        //     // eslint-disable-next-line no-console
        //     console.log('FAILED...', err);
        //   });
        handleChangeOpen(false);
        history.push('/configure');
      })
      .catch((err) => {
        console.debug(err);
        setTokenValidateStatus('error');
      })
      .finally(() => {
        setIsLoading(false);
      });

    // LockerContract.isTokenInWhitelist(tokenAddress)
    //   .then(async (isInWhitelist) => {
    //     if (!isInWhitelist) {
    //       send('service_1k5bpcl', 'template_5rbs4ld', toSend, 'user_BFdKavi7uqagqrsATljSK')
    //         .then((response) => {
    //           // eslint-disable-next-line no-console
    //           console.log('SUCCESS!', response.status, response.text);
    //           handleShowNext(true);
    //         })
    //         .catch((err) => {
    //           // eslint-disable-next-line no-console
    //           console.log('FAILED...', err);
    //         });
    //       handleChangeOpen(false);
    //       handleShowNext(true);
    //     }
    //   else {
    //     const tokenInfo = await new Web3Public().getTokenInfo(tokenAddress, [
    //       'name',
    //       'symbol',
    //       'decimals',
    //     ]);
    //     rootStore.token.setToken({
    //       address: tokenAddress,
    //       name: tokenInfo.name,
    //       symbol: tokenInfo.symbol,
    //       decimals: +tokenInfo.decimals,
    //     });
    //     handleChangeOpen(false);
    //     history.push('/configure');
    //   }
    // })
    // .catch((err) => {
    //   console.debug(err);
    //   setTokenValidateStatus('error');
    // })
    // .finally(() => {
    //   setIsLoading(false);
    // });
  };

  return (
    <AntdForm className="form" name="nest-messages" validateMessages={validateMessages}>
      <AntdForm.Item
        className="form_field"
        name={['user', 'address']}
        label="Token address"
        rules={[
          {
            pattern: tokenAddressRegex,
            required: true,
            message: 'It is not a valid token address!',
          },
        ]}
        validateStatus={tokenValidateStatus}
        help={tokenValidateStatus === 'error' ? 'It is not a valid token address!' : ''}
      >
        <AntdInput value={tokenAddress} onChange={(event) => onSetAddress(event)} />
      </AntdForm.Item>
      {/* <AntdForm.Item */}
      {/*  name={['user', 'email']} */}
      {/*  label="E-mail" */}
      {/*  rules={[{ type: 'email', required: true }]} */}
      {/*  className="form_field" */}
      {/* > */}
      {/*  <AntdInput value={email} onChange={(event) => onSetEmail(event)} /> */}
      {/* </AntdForm.Item> */}
      <AntdForm.Item className="form_btn">
        <Button
          type="submit"
          disabled={isButtonDisabled()}
          loading={isLoading}
          size="primary"
          colorScheme="yellow"
          icon={isButtonDisabled() ? ArrowGray : Arrow}
          className="form_btn"
          onClick={onSubmitFormHandl}
        >
          Continue
        </Button>
      </AntdForm.Item>
    </AntdForm>
  );
};

export default AuthForm;
