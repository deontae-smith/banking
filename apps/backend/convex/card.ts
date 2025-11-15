import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getCardById = query({
  args: { id: v.id('card') },
  handler: async ({ db }, { id }) => {
    const card = await db.get(id);
    return card || null;
  },
});

export const sendMoney = mutation({
  args: {
    senderCardId: v.id('card'),
    recipientCardId: v.id('card'),
    amount: v.number(),
  },
  handler: async ({ db }, { senderCardId, recipientCardId, amount }) => {
    if (amount <= 0) throw new Error('Amount must be greater than zero');

    const senderCard = await db.get(senderCardId);
    const recipientCard = await db.get(recipientCardId);

    if (!senderCard) throw new Error('Sender card not found');
    if (!recipientCard) throw new Error('Recipient card not found');

    if (senderCard.balance < amount) throw new Error('Insufficient funds');

    // Helper function to round to 2 decimal places
    const round2 = (num: number) => Number(num.toFixed(2));

    const newSenderBalance = round2(senderCard.balance - amount);
    const newRecipientBalance = round2(recipientCard.balance + amount);

    // Update balances atomically
    await db.patch(senderCardId, { balance: newSenderBalance });
    await db.patch(recipientCardId, { balance: newRecipientBalance });

    return {
      senderNewBalance: newSenderBalance,
      recipientNewBalance: newRecipientBalance,
    };
  },
});

export const updateCardLockStatus = mutation({
  args: {
    cardId: v.id('card'),
    currentStatus: v.boolean(),
  },
  handler: async ({ db }, { cardId, currentStatus }) => {
    // 1. Fetch card
    const card = await db.get(cardId);
    if (!card) throw new Error('Card not found');

    const isLocked = card.metadata.isLocked;

    // 2. Ensure current status matches database
    if (isLocked !== currentStatus) {
      throw new Error(
        `Current status mismatch: expected ${currentStatus}, got ${isLocked}`
      );
    }

    // 3. Update card lock status
    await db.patch(cardId, {
      metadata: {
        ...card.metadata,
        isLocked: !isLocked,
      },
    });

    // 4. Return the new status
    return { success: true, newStatus: !isLocked };
  },
});
