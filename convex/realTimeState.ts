import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert the real-time signal chain state for a user session.
 * Writes within 50ms target per Requirement 20.3.
 * Validates: Requirements 20.3
 */
export const updateRealTimeState = mutation({
  args: {
    userId: v.id("userProfiles"),
    sessionId: v.string(),
    currentState: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("realTimeUserSignalChain")
      .withIndex("by_user_session", (q) =>
        q.eq("userId", args.userId).eq("sessionId", args.sessionId)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentState: args.currentState,
        lastUpdated: now,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("realTimeUserSignalChain", {
        userId: args.userId,
        sessionId: args.sessionId,
        currentState: args.currentState,
        lastUpdated: now,
      });
      return id;
    }
  },
});
