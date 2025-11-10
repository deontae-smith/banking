import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * All objects prefixed with "C" are Convex-specific schema validators.
 * Each "C" type has a corresponding TypeScript interface used elsewhere in the app
 * to ensure type safety and maintain a clear separation between Convex schema definitions
 * and application-level TypeScript types.
 */

const C_NameObject = v.object({
  firstName: v.string(),
  lastName: v.string(),
});

const C_AddressObject = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  zipCode: v.string(),
  country: v.string(),
});

const C_CardMeta = v.object({
  isLocked: v.boolean(),
  spendingLimit: v.number(),
  cardType: v.string(), // e.g. "debit" | "credit"
});

const C_ExpirationObject = v.object({
  month: v.string(), // e.g. "12"
  year: v.string(), // e.g. "28" or "2028"
});

export default defineSchema({
  user: defineTable({
    name: C_NameObject,
    email: v.string(),
    clerk_id: v.string(), // ID FROM CLERK
    address: C_AddressObject,
    account: v.id('account'),
  }),

  account: defineTable({
    number: v.string(),
    routing: v.string(),
    user: v.id('user'),
    card: v.id('card'),
  }),

  card: defineTable({
    number: v.string(),
    expiration: C_ExpirationObject,
    cvv: v.string(),
    metadata: C_CardMeta,
    account: v.id('account'),
  }),
});
