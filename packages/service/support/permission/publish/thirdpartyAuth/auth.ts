import type { GetServerSidePropsContext } from 'next';
import { ThirdPartyAuthEnum } from '@fastgpt/global/support/outLink/constant';
import {
  fastgptAuthThirdPartyLogin,
  fastgptAuthThirdPartyRedirectLoginUrl,
  fastgptAuthThirdPartyTokenValid
} from './fastgpt';

export type AuthThirdPartyLoginFn = (
  context: GetServerSidePropsContext
) => Promise<{ success: boolean; shareToken?: string }>;
export type AuthThirdPartyTokenValidFn = (shareToken?: string) => Promise<boolean>;
export type ThirdPartyAuthMapType = {
  [key in ThirdPartyAuthEnum]: {
    name: string;
    description: string;
    // TODO: authThirdPartyLogin,authThirdPartyTokenValid 取消可选参数，变为必须参数
    authThirdPartyLogin?: AuthThirdPartyLoginFn;
    authThirdPartyTokenValid?: AuthThirdPartyTokenValidFn;
    authThirdPartyRedirectLoginUrl?: (url: string) => string;
  };
};

export const ThirdPartyAuthMap: ThirdPartyAuthMapType = {
  [ThirdPartyAuthEnum.NONE]: {
    name: 'None',
    description: 'No third-party authentication required.'
  },
  [ThirdPartyAuthEnum.FASTGPT]: {
    name: 'FastGPT',
    description: 'FastGPT authentication for accessing the service.',
    authThirdPartyLogin: fastgptAuthThirdPartyLogin,
    authThirdPartyTokenValid: fastgptAuthThirdPartyTokenValid,
    authThirdPartyRedirectLoginUrl: fastgptAuthThirdPartyRedirectLoginUrl
  },
  [ThirdPartyAuthEnum.SZTU]: {
    name: 'SZTU',
    description: 'SZTU authentication for accessing the service.'
  }
};
