import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new user profile with a hashed password placeholder.
 * In production the password would be hashed with bcrypt/Argon2 before
 * reaching this function; here we store the value as-is (placeholder).
 * Validates: Requirements 12.1, 12.2
 */
export const signUp = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate email
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("userProfiles", {
      email: args.email,
      displayName: args.displayName,
      passwordHash: args.passwordHash,
      tier: "free",
      createdAt: now,
      lastLoginAt: now,
      failedLoginAttempts: 0,
    });

    // Create an empty bio record for the new user
    await ctx.db.insert("userBioInformation", { userId });

    return userId;
  },
});

/**
 * Validate credentials and return the user profile on success.
 * Tracks failed login attempts and locks the account for 60 seconds
 * after 5 consecutive failures.
 * Validates: Requirements 12.1, 12.5
 */
export const login = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const now = Date.now();

    // Check if the account is currently locked
    if (user.lockedUntil && now < user.lockedUntil) {
      const remainingSec = Math.ceil((user.lockedUntil - now) / 1000);
      throw new Error(
        `Account is locked. Try again in ${remainingSec} seconds.`
      );
    }

    // Validate password (placeholder comparison — production would use bcrypt.compare)
    if (user.passwordHash !== args.passwordHash) {
      const attempts = user.failedLoginAttempts + 1;
      const patch: Record<string, unknown> = { failedLoginAttempts: attempts };

      // Lock after 5 consecutive failures for 60 seconds
      if (attempts >= 5) {
        patch.lockedUntil = now + 60 * 1000;
      }

      await ctx.db.patch(user._id, patch);
      throw new Error("Invalid email or password.");
    }

    // Successful login — reset failed attempts and update last login
    await ctx.db.patch(user._id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: now,
    });

    return {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      tier: user.tier,
      createdAt: user.createdAt,
      lastLoginAt: now,
    };
  },
});

/**
 * Generate a password reset token (placeholder for email flow).
 * In production this would send an email with a time-limited link.
 * Validates: Requirements 12.6
 */
export const resetPassword = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      // Return silently to avoid leaking whether the email exists
      return { success: true };
    }

    // Placeholder: in production, generate a token, store it with a 30-min
    // expiry, and send an email. For now we just acknowledge the request.
    return { success: true, userId: user._id };
  },
});

/**
 * Return a user profile by ID.
 * Validates: Requirements 12.4
 */
export const getUserProfile = query({
  args: { userId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      tier: user.tier,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  },
});

/**
 * Update a user's display name and other profile fields.
 * Validates: Requirements 12.4
 */
export const updateUserProfile = mutation({
  args: {
    userId: v.id("userProfiles"),
    displayName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, displayName, firstName, lastName, avatarUrl, bio } = args;

    // Update core profile fields
    if (displayName !== undefined) {
      await ctx.db.patch(userId, { displayName });
    }

    // Update bio information
    const bioFields: Record<string, string | undefined> = {};
    if (firstName !== undefined) bioFields.firstName = firstName;
    if (lastName !== undefined) bioFields.lastName = lastName;
    if (avatarUrl !== undefined) bioFields.avatarUrl = avatarUrl;
    if (bio !== undefined) bioFields.bio = bio;

    if (Object.keys(bioFields).length > 0) {
      const existingBio = await ctx.db
        .query("userBioInformation")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

      if (existingBio) {
        await ctx.db.patch(existingBio._id, bioFields);
      } else {
        await ctx.db.insert("userBioInformation", { userId, ...bioFields });
      }
    }
  },
});
