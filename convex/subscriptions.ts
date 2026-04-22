import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the subscription tier for a given user.
 * Returns the tier string from the subscriptions table, falling back to the
 * tier stored on the user profile, or "free" if no record exists.
 * Validates: Requirements 1.1
 */
export const getUserTier = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (subscription && subscription.status === "active") {
      return subscription.tier;
    }

    // Fall back to the tier on the user profile
    const user = await ctx.db.get(args.userId);
    return user?.tier ?? "free";
  },
});

/**
 * IDs of content available on the Free tier.
 * These must stay in sync with the client-side access-control module.
 */
const FREE_AMP_IDS = new Set(["winston-chl"]);
const FREE_PEDAL_IDS = new Set(["mac-super-comp", "mac-dyna-comp", "king-super-overdrive", "tokyo-tube-screamer"]);
const FREE_CABINET_IDS = new Set(["cab-winston-4x12"]);

/** Pedal IDs that require the Next Gen tier. */
const NEXT_GEN_PEDAL_IDS = new Set(["king-me-90"]);

function getFreeSet(contentType: string): Set<string> {
  switch (contentType) {
    case "amp": return FREE_AMP_IDS;
    case "pedal": return FREE_PEDAL_IDS;
    case "cabinet": return FREE_CABINET_IDS;
    default: return new Set();
  }
}

function getContentLabel(contentType: string): string {
  switch (contentType) {
    case "amp": return "amp model";
    case "pedal": return "FX pedal";
    case "cabinet": return "cabinet";
    default: return "content";
  }
}

/**
 * Check whether a user's subscription tier allows access to specific content.
 * Free tier: restricted to 1 amp, free-tier pedals, 1 cabinet.
 * Classic and Next Gen tiers: full access.
 * Returns { allowed, requiredTier?, upgradeMessage? }.
 * Validates: Requirements 1.1, 1.5
 */
export const checkContentAccess = query({
  args: {
    userId: v.id("userProfiles"),
    contentType: v.string(),
    contentId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    let tier = "free";
    if (subscription && subscription.status === "active") {
      tier = subscription.tier;
    } else {
      const user = await ctx.db.get(args.userId);
      tier = user?.tier ?? "free";
    }

    // Classic and Next Gen tiers have full access
    if (tier === "classic" || tier === "next_gen") {
      return { allowed: true };
    }

    // Free tier — check against the allowed free-tier set
    if (getFreeSet(args.contentType).has(args.contentId)) {
      return { allowed: true };
    }

    // Determine the minimum tier needed
    const requiredTier =
      args.contentType === "pedal" && NEXT_GEN_PEDAL_IDS.has(args.contentId)
        ? "next_gen"
        : "classic";
    const tierLabel = requiredTier === "next_gen" ? "Next Gen" : "Classic";

    return {
      allowed: false,
      requiredTier,
      upgradeMessage: `Upgrade to ${tierLabel} to unlock this ${getContentLabel(args.contentType)}.`,
    };
  },
});


/**
 * Upgrade a user's subscription to a new tier.
 * Updates both the subscriptions table and the user profile tier field.
 * Validates: Requirements 1.6
 */
export const upgradeSubscription = mutation({
  args: {
    userId: v.id("userProfiles"),
    newTier: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update or create the subscription record
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tier: args.newTier,
        status: "active",
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        tier: args.newTier,
        status: "active",
        currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        createdAt: now,
      });
    }

    // Keep the user profile tier in sync
    await ctx.db.patch(args.userId, { tier: args.newTier });
  },
});

/**
 * Handle a payment failure by downgrading the user to the Free tier.
 * Updates both the subscriptions table and the user profile.
 * Must complete within 60s of the failure event (Requirement 1.7).
 * Validates: Requirements 1.7
 */
export const handlePaymentFailure = mutation({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    // Downgrade subscription record
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        tier: "free",
        status: "past_due",
      });
    }

    // Downgrade user profile tier
    await ctx.db.patch(args.userId, { tier: "free" });
  },
});
