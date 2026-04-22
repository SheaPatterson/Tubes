import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Return the settings for a user. Returns null if no settings record exists.
 * Validates: Requirements 16.1
 */
export const getSettings = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

/**
 * Upsert user settings — creates the record if it doesn't exist, otherwise
 * patches the provided fields. Covers audio interface, recording, CPU/GPU,
 * and AI blend settings.
 * Validates: Requirements 16.1, 16.6
 */
export const updateSettings = mutation({
  args: {
    userId: v.id("userProfiles"),
    audioInterfaceId: v.optional(v.string()),
    bufferSize: v.optional(v.number()),
    sampleRate: v.optional(v.number()),
    recordingFormat: v.optional(v.string()),
    recordingBitDepth: v.optional(v.number()),
    cpuPriority: v.optional(v.string()),
    gpuEnabled: v.optional(v.boolean()),
    aiBlendLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;

    // Build a patch object from only the provided fields
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existing._id, patch);
      }
      return existing._id;
    } else {
      const id = await ctx.db.insert("userSettings", {
        userId,
        ...patch,
      });
      return id;
    }
  },
});
