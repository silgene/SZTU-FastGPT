import { type AppDetailType } from '@fastgpt/global/core/app/type';
import { type OutlinkAppType, type OutLinkSchema } from '@fastgpt/global/support/outLink/type';
import { parseHeaderCert } from '../controller';
import { MongoOutLink } from '../../outLink/schema';
import { OutLinkErrEnum } from '@fastgpt/global/common/error/code/outLink';
import { OwnerPermissionVal } from '@fastgpt/global/support/permission/constant';
import { authAppByTmbId } from '../app/auth';
import { type AuthModeType, type AuthResponseType } from '../type';
import Cookie from 'cookie';
import { ThirdPartyAuthMap } from './thirdpartyAuth/auth';

/* crud outlink permission */
export async function authOutLinkCrud({
  outLinkId,
  per = OwnerPermissionVal,
  ...props
}: AuthModeType & {
  outLinkId: string;
}): Promise<
  AuthResponseType & {
    app: AppDetailType;
    outLink: OutLinkSchema;
  }
> {
  const result = await parseHeaderCert(props);
  const { tmbId, teamId } = result;

  const { app, outLink } = await (async () => {
    const outLink = await MongoOutLink.findOne({ _id: outLinkId, teamId });
    if (!outLink) {
      return Promise.reject(OutLinkErrEnum.unExist);
    }

    if (String(outLink.teamId) !== teamId) {
      return Promise.reject(OutLinkErrEnum.unAuthLink);
    }

    const { app } = await authAppByTmbId({
      tmbId,
      appId: outLink.appId,
      per
    });

    return {
      outLink,
      app
    };
  })();

  return {
    ...result,
    permission: app.permission,
    app,
    outLink
  };
}

/* outLink exist and it app exist */
export async function authOutLinkValid<T extends OutlinkAppType = any>({
  shareId,
  shareToken
}: {
  shareId?: string;
  shareToken?: string;
}) {
  if (!shareId) {
    return Promise.reject(OutLinkErrEnum.linkUnInvalid);
  }
  const outLinkConfig = await MongoOutLink.findOne({ shareId }).lean<OutLinkSchema<T>>();

  if (!outLinkConfig) {
    return Promise.reject(OutLinkErrEnum.linkUnInvalid);
  }
  if (outLinkConfig?.thirdPartyAuth?.needAuth) {
    // 第三方认证鉴权
    if (!shareToken) {
      return Promise.reject(OutLinkErrEnum.unAuthUser);
    }
    const authType = outLinkConfig.thirdPartyAuth.authType;

    const isValid = !!(await ThirdPartyAuthMap[authType].authThirdPartyTokenValid?.(shareToken));
    if (!isValid) {
      return Promise.reject(OutLinkErrEnum.unAuthUser);
    }
  }
  return {
    appId: outLinkConfig.appId,
    outLinkConfig: outLinkConfig
  };
}
