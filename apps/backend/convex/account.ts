import { query } from './_generated/server';
import { v } from 'convex/values';

export const getAccountById = query({
  args: { accountId: v.id('account') },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db.get(accountId);
    return account;
  },
});
