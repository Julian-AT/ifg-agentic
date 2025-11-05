import type { UserType } from '@/app/(auth)/auth';
import { chatModels, type ChatModel } from './models';

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel['model'][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 200,
    availableChatModelIds: chatModels.map((chatModel) => chatModel.model),
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: chatModels.map((chatModel) => chatModel.model),
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
