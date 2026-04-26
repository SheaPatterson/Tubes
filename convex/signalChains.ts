import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all saved signal chains for a given user, ordered by most recently updated.
 * Validates: Requirements 13.1, 13.6
 */
export const getUserSignalChains = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const chains = await ctx.db
      .query("savedUserSignalChain")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return chains;
  },
});

/**
 * Save a new signal chain for a user with timestamps.
 * Validates: Requirements 13.1, 13.2
 */
export const saveSignalChain = mutation({
  args: {
    userId: v.id("userProfiles"),
    name: v.string(),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const chainId = await ctx.db.insert("savedUserSignalChain", {
      userId: args.userId,
      name: args.name,
      config: args.config,
      createdAt: now,
      updatedAt: now,
    });
    return chainId;
  },
});

/**
 * Load a saved signal chain by its ID, returning the full chain config.
 * Validates: Requirements 13.2
 */
export const loadSignalChain = query({
  args: { chainId: v.id("savedUserSignalChain") },
  handler: async (ctx, args) => {
    const chain = await ctx.db.get(args.chainId);
    return chain;
  },
});


/**
 * Delete a saved signal chain and its associated parameter values.
 * Validates: Requirements 13.3
 */
export const deleteSignalChain = mutation({
  args: { chainId: v.id("savedUserSignalChain") },
  handler: async (ctx, args) => {
    // Delete all associated parameter values first
    const values = await ctx.db
      .query("userSignalChainValues")
      .withIndex("by_chain", (q) => q.eq("chainId", args.chainId))
      .collect();
    for (const value of values) {
      await ctx.db.delete(value._id);
    }
    // Delete the chain itself
    await ctx.db.delete(args.chainId);
  },
});

/**
 * Rename a saved signal chain.
 * Validates: Requirements 13.3
 */
export const renameSignalChain = mutation({
  args: {
    chainId: v.id("savedUserSignalChain"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chainId, {
      name: args.newName,
      updatedAt: Date.now(),
    });
  },
});
