import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const addTransactionToCard = mutation({
  args: {
    cardId: v.id('card'),

    title: v.string(),

    type: v.union(
      v.literal('TRANSFER'),
      v.literal('DEPOSIT'),
      v.literal('WITHDRAWAL'),
      v.literal('PAYMENT')
    ),

    amount: v.number(),

    status: v.union(
      v.literal('PENDING'),
      v.literal('COMPLETED'),
      v.literal('FAILED'),
      v.literal('REVERSED')
    ),

    senderIdentifier: v.id('card'),
    recipientCardId: v.id('card'),
  },

  handler: async ({ db }, args) => {
    const { cardId, ...transactionData } = args;

    const transactionId = await db.insert('transaction', {
      ...transactionData,
      timestamp: Date.now(),
    });

    const card = await db.get(args.cardId);

    await db.patch(args.cardId, {
      transactions: [...(card?.transactions || []), transactionId],
    });

    return transactionId;
  },
});
