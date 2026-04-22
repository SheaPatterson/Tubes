import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Return all MIDI mappings for a user.
 * Validates: Requirements 11.2, 11.6
 */
export const getMappings = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("midiMappings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Create a new MIDI mapping for a user.
 * Validates: Requirements 11.2, 11.4
 */
export const createMapping = mutation({
  args: {
    userId: v.id("userProfiles"),
    channel: v.number(),
    type: v.string(),
    number: v.number(),
    targetType: v.string(),
    targetConfig: v.any(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("midiMappings", {
      userId: args.userId,
      channel: args.channel,
      type: args.type,
      number: args.number,
      targetType: args.targetType,
      targetConfig: args.targetConfig,
    });
    return id;
  },
});

/**
 * Delete a MIDI mapping by its ID.
 * Validates: Requirements 11.6
 */
export const deleteMapping = mutation({
  args: { mappingId: v.id("midiMappings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mappingId);
  },
});

/**
 * Update a MIDI mapping's target configuration.
 * Validates: Requirements 11.6
 */
export const updateMapping = mutation({
  args: {
    mappingId: v.id("midiMappings"),
    targetType: v.optional(v.string()),
    targetConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.targetType !== undefined) patch.targetType = args.targetType;
    if (args.targetConfig !== undefined) patch.targetConfig = args.targetConfig;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.mappingId, patch);
    }
  },
});
