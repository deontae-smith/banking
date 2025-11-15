import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

const C_UserMetadata = v.object({
  contacts: v.array(
    v.object({
      id: v.id("user"),
      phoneNumber: v.string(),
    })
  ),
});

export default defineSchema({
  user: defineTable({
    name: C_NameObject,
    email: v.string(),
    clerk_id: v.string(),
    address: C_AddressObject,
    phoneNumber: v.string(),
    account: v.optional(v.id("account")),
    metadata: C_UserMetadata,
  })
    .index("by_clerkId", ["clerk_id"])
    .index("by_phoneNumber", ["phoneNumber"]),

  account: defineTable({
    number: v.string(),
    routing: v.string(),
    user: v.id("user"),
    // Make card optional:
    card: v.optional(v.id("card")),
  }),

  transaction: defineTable({
    senderIdentifier: v.union(v.id("card"), v.string()), // card ID or external identifier
    recipientCardId: v.id("card"),
    amount: v.number(),
    title: v.string(), //
    currency: v.string(), // e.g. "USD"
    type: v.string(), // e.g. "transfer", "deposit", "withdrawal", "payment"
    status: v.union(
      v.literal("PENDING"),
      v.literal("COMPLETED"),
      v.literal("FAILED"),
      v.literal("REVERSED")
    ),
    timestamp: v.number(), // Unix epoch (Date.now())
    // reference: v.string(), // unique transaction reference or code
    metadata: v.optional(
      v.object({
        initiatedBy: v.string(), // clerk_id or system
        method: v.union(v.literal("INSTANT"), v.literal("SCHEDULED")),
        fees: v.optional(v.number()),
        location: v.optional(v.string()),
      })
    ),
  })
    .index("by_senderIdentifier", ["senderIdentifier"])
    .index("by_recipientCard", ["recipientCardId"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"]),

  card: defineTable({
    number: v.string(),
    expiration: C_ExpirationObject,
    cvv: v.string(),
    metadata: C_CardMeta,
    balance: v.number(),
    account: v.id("account"),
    transactions: v.optional(v.array(v.id("transaction"))),
  }).index("by_account", ["account"]),
});
