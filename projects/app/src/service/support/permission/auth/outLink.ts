import { POST } from '@fastgpt/service/common/api/plusRequest';
import type {
  AuthOutLinkChatProps,
  AuthOutLinkLimitProps,
  AuthOutLinkInitProps,
  AuthOutLinkResponse
} from '@fastgpt/global/support/outLink/api.d';
import { type ShareChatAuthProps } from '@fastgpt/global/support/permission/chat';
import { authOutLinkValid } from '@fastgpt/service/support/permission/publish/authLink';
import { getUserChatInfoAndAuthTeamPoints } from '@fastgpt/service/support/permission/auth/team';
import { AuthUserTypeEnum } from '@fastgpt/global/support/permission/constant';
import { OutLinkErrEnum } from '@fastgpt/global/common/error/code/outLink';
import { type OutLinkSchema } from '@fastgpt/global/support/outLink/type';

export function authOutLinkInit(data: AuthOutLinkInitProps): Promise<AuthOutLinkResponse> {
  if (!global.feConfigs?.isPlus) return Promise.resolve({ uid: data.outLinkUid });
  return POST<AuthOutLinkResponse>('/support/outLink/authInit', data);
}
export function authOutLinkChatLimit(data: AuthOutLinkLimitProps): Promise<AuthOutLinkResponse> {
  if (!global.feConfigs?.isPlus) return Promise.resolve({ uid: data.outLinkUid });
  return POST<AuthOutLinkResponse>('/support/outLink/authChatStart', data);
}

export const authOutLink = async ({
  shareId,
  outLinkUid,
  shareToken
}: ShareChatAuthProps): Promise<{
  uid: string;
  appId: string;
  outLinkConfig: OutLinkSchema;
}> => {
  if (!outLinkUid) {
    return Promise.reject(OutLinkErrEnum.linkUnInvalid);
  }
  const result = await authOutLinkValid({ shareId, shareToken });

  const { uid } = await authOutLinkInit({
    outLinkUid,
    tokenUrl: result.outLinkConfig.limit?.hookUrl
  });

  return {
    ...result,
    uid
  };
};

export async function authOutLinkChatStart({
  shareId,
  ip,
  outLinkUid,
  question,
  shareToken
}: AuthOutLinkChatProps & {
  shareId: string;
}) {
  // get outLink and app
  const { outLinkConfig, appId } = await authOutLinkValid({ shareId, shareToken });

  // check ai points and chat limit
  const [{ timezone, externalProvider }, { uid }] = await Promise.all([
    getUserChatInfoAndAuthTeamPoints(outLinkConfig.tmbId),
    authOutLinkChatLimit({ outLink: outLinkConfig, ip, outLinkUid, question })
  ]);

  return {
    sourceName: outLinkConfig.name,
    teamId: outLinkConfig.teamId,
    tmbId: outLinkConfig.tmbId,
    authType: AuthUserTypeEnum.token,
    responseDetail: outLinkConfig.responseDetail,
    showNodeStatus: outLinkConfig.showNodeStatus,
    timezone,
    externalProvider,
    appId,
    uid
  };
}
