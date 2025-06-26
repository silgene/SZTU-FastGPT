import { authUserSession } from '../../../user/session';
import { type AuthThirdPartyTokenValidFn, type AuthThirdPartyLoginFn } from './auth';
import Cookie from 'cookie';

export const fastgptAuthThirdPartyTokenValid: AuthThirdPartyTokenValidFn = async (shareToken) => {
  if (!shareToken) {
    return false;
  }
  try {
    await authUserSession(shareToken);
  } catch (error) {
    return false;
  }
  return true;
};

export const fastgptAuthThirdPartyLogin: AuthThirdPartyLoginFn = async (context) => {
  const fastgptToken = Cookie.parse(context.req.headers.cookie || '')?.fastgpt_token;
  // 鉴权fastgptToken
  const isValid = await fastgptAuthThirdPartyTokenValid(fastgptToken);
  return {
    success: isValid,
    shareToken: isValid ? fastgptToken : undefined
  };
};
export const fastgptAuthThirdPartyRedirectLoginUrl = (url: string) => {
  return `${new URL(url).origin}/login?callbackUrl=${encodeURIComponent(url)}`;
};
