import { query } from './_generated/server';
import { v } from 'convex/values';

export const getCardById = query({
  args: { id: v.id('card') },
  handler: async ({ db }, { id }) => {
    const card = await db.get(id);
    return card || null;
  },
});
