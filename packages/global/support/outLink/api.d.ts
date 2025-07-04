import type { HistoryItemType } from '../../core/chat/type.d';
import type { OutLinkSchema } from './type.d';

export type AuthOutLinkInitProps = {
  outLinkUid: string;
  tokenUrl?: string;
};
export type AuthOutLinkChatProps = {
  ip?: string | null;
  outLinkUid: string;
  question: string;
  shareToken?: string;
};
export type AuthOutLinkLimitProps = AuthOutLinkChatProps & { outLink: OutLinkSchema };
export type AuthOutLinkResponse = {
  uid: string;
};
