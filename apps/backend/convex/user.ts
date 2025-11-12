// mutations.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  generateCardNumber,
  generateExpirationDate,
  generateCvv,
} from '../utils';

export const createUserWithAccountAndCard = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    number: v.string(),
    name: v.object({ firstName: v.string(), lastName: v.string() }),
    address: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
  },
  handler: async (ctx, { clerkId, email, name, address, number }) => {
    // 1. Create user (account reference optional because we update it later)
    const userDoc = await ctx.db.insert('user', {
      name,
      email,
      clerk_id: clerkId,
      address,
      phoneNumber: number,
      metadata: { contacts: [] },

      // account field is now optional in schema, so omit or undefined
      // account: undefined
    });

    // 2. Create account linked to this users
    const accountNumber = generateCardNumber(12);
    const routingNumber = generateCardNumber(9);
    const accountDoc = await ctx.db.insert('account', {
      number: accountNumber,
      routing: routingNumber,
      user: userDoc,
      // card field is optional
      // card: undefined
    });

    // 3. Create card linked to the account
    const { month, year } = generateExpirationDate(4);
    const cardNumber = generateCardNumber(16);
    const cvv = generateCvv(3);
    const cardDoc = await ctx.db.insert('card', {
      number: cardNumber,
      expiration: { month, year },
      cvv,
      metadata: {
        isLocked: false,
        spendingLimit: 0,
        cardType: 'debit',
      },
      account: accountDoc,
      balance: 0,
    });

    // 4. Update account to set card field
    await ctx.db.patch(accountDoc, { card: cardDoc });

    // 5. Update user to set account field
    await ctx.db.patch(userDoc, { account: accountDoc });

    return { user: userDoc, account: accountDoc, card: cardDoc };
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query('user')
      .filter((q) => q.eq(q.field('clerk_id'), clerkId))
      .first();
    return user || null;
  },
});

export const getUserByPhoneNumber = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, { phoneNumber }) => {
    const user = await ctx.db
      .query('user')
      .withIndex('by_phoneNumber', (q) => q.eq('phoneNumber', phoneNumber))
      .first();

    return user || null;
  },
});

export const addContactToUser = mutation({
  args: {
    targetClerkId: v.string(),
    contact: v.object({
      id: v.id('user'),
      phoneNumber: v.string(),
    }),
  },
  handler: async (ctx, { targetClerkId, contact }) => {
    // Find the target user by their Clerk ID
    const targetUser = await ctx.db
      .query('user')
      .withIndex('by_clerkId', (q) => q.eq('clerk_id', targetClerkId))
      .first();

    if (!targetUser) throw new Error('Target user not found');

    // Retrieve existing contacts or create an empty array
    const contacts = targetUser.metadata?.contacts || [];

    contacts.push(contact);
    await ctx.db.patch(targetUser._id, {
      metadata: { contacts },
    });

    // Return the updated user document
    return await ctx.db.get(targetUser._id);
  },
});

export const getUserById = query({
  args: { id: v.id('user') },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (!user) return null;
    return user;
  },
});
