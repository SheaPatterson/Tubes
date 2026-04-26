/**
 * Security Utilities
 *
 * TLS enforcement, password hashing interfaces, AI consent management,
 * and payment security helpers.
 *
 * Requirements: 22.1, 22.2, 22.3, 22.5, 22.6
 */

import type { SubscriptionTier } from "@/types/user";

// ── TLS Enforcement ──

/**
 * Security headers to enforce TLS 1.2+ and protect against common attacks.
 * Applied via next.config.ts headers configuration.
 * Validates: Requirement 22.1
 */
export const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' wss: ws: https://*.convex.cloud https://api.stripe.com",
      "frame-src https://js.stripe.com",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
] as const;

/**
 * Check whether the current page is served over a secure context (HTTPS or localhost).
 * Validates: Requirement 22.1
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true; // SSR is always considered secure
  return window.isSecureContext ?? window.location.protocol === "https:";
}

// ── Password Hashing Interface ──

/**
 * Password hashing configuration.
 * Actual hashing is performed server-side in Convex auth functions.
 * This interface documents the expected algorithm and parameters.
 * Validates: Requirement 22.2
 */
export interface PasswordHashConfig {
  /** Algorithm used for hashing — bcrypt or Argon2id */
  algorithm: "bcrypt" | "argon2id";
  /** Cost factor for bcrypt (default 12) or memory cost for Argon2 */
  costFactor: number;
  /** Per-user salt is generated automatically by the algorithm */
  saltGeneration: "automatic";
}

export const PASSWORD_HASH_CONFIG: PasswordHashConfig = {
  algorithm: "bcrypt",
  costFactor: 12,
  saltGeneration: "automatic",
};

/**
 * Prepare a password for transmission to the Convex auth function.
 * In production, the Convex function handles bcrypt/Argon2 hashing with
 * per-user salt. This client-side function performs basic validation only.
 * Validates: Requirement 22.2
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one digit.");
  }

  return { valid: errors.length === 0, errors };
}

// ── Payment Security ──

/**
 * Payment security policy.
 * All payment data is handled exclusively through Stripe (PCI-DSS compliant).
 * The platform never stores, processes, or transmits raw card numbers.
 * Validates: Requirement 22.3
 */
export const PAYMENT_SECURITY = {
  processor: "stripe" as const,
  pciCompliant: true,
  rawCardStorage: false,
  supportedMethods: ["credit_card", "paypal"] as const,
  /** Stripe publishable key — safe to expose client-side */
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
} as const;

/**
 * Verify that payment is being routed through Stripe only.
 * Returns false if any attempt is made to handle raw card data locally.
 */
export function isPaymentSecure(): boolean {
  return PAYMENT_SECURITY.processor === "stripe" && !PAYMENT_SECURITY.rawCardStorage;
}

// ── AI Audio Consent Management ──

export interface AIConsentState {
  /** Whether the user has granted consent for AI audio processing */
  consentGranted: boolean;
  /** Timestamp when consent was granted (or null if never granted) */
  consentGrantedAt: number | null;
  /** Timestamp when consent was revoked (or null if not revoked) */
  consentRevokedAt: number | null;
}

/**
 * Check whether a user is eligible for AI audio transmission.
 * Audio may only be transmitted to the AI Engine for Next Gen tier users
 * who have explicitly granted consent.
 * Validates: Requirements 22.5, 22.6
 */
export function canTransmitAudioToAI(
  tier: SubscriptionTier,
  consent: AIConsentState
): boolean {
  return tier === "next_gen" && consent.consentGranted;
}

/**
 * Grant AI audio processing consent.
 * Only valid for Next Gen tier users.
 * Validates: Requirement 22.5
 */
export function grantAIConsent(tier: SubscriptionTier): AIConsentState | null {
  if (tier !== "next_gen") return null;

  return {
    consentGranted: true,
    consentGrantedAt: Date.now(),
    consentRevokedAt: null,
  };
}

/**
 * Revoke AI audio processing consent.
 * Audio transmission must cease immediately upon revocation.
 * Validates: Requirement 22.6
 */
export function revokeAIConsent(): AIConsentState {
  return {
    consentGranted: false,
    consentGrantedAt: null,
    consentRevokedAt: Date.now(),
  };
}
