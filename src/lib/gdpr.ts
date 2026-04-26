/**
 * GDPR Data Export and Account Deletion
 *
 * Client-side interfaces that call Convex mutations/queries to fulfill
 * GDPR data subject rights: data export and account deletion.
 *
 * Validates: Requirement 22.4
 */

import type { ConvexReactClient } from "convex/react";

/** Convex document ID type placeholder — actual type comes from generated code */
type UserId = string;

// ── Types ──

export interface GDPRExportData {
  exportedAt: string;
  profile: {
    email: string;
    displayName: string;
    tier: string;
    createdAt: string;
    lastLoginAt: string;
  };
  bio: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  } | null;
  signalChains: Array<{
    name: string;
    config: unknown;
    createdAt: string;
    updatedAt: string;
  }>;
  midiMappings: Array<{
    channel: number;
    type: string;
    number: number;
    targetType: string;
    targetConfig: unknown;
  }>;
  settings: {
    audioInterfaceId?: string;
    bufferSize?: number;
    sampleRate?: number;
    recordingFormat?: string;
    recordingBitDepth?: number;
    cpuPriority?: string;
    gpuEnabled?: boolean;
    aiBlendLevel?: number;
  } | null;
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: string;
    createdAt: string;
  } | null;
}

// ── Data Export ──

/**
 * Export all user data as a JSON object for GDPR compliance.
 * Collects profile, bio, signal chains, MIDI mappings, settings, and subscription.
 * Validates: Requirement 22.4
 */
export async function exportUserData(
  convex: ConvexReactClient,
  userId: UserId
): Promise<GDPRExportData> {
  // Fetch all user data in parallel via Convex queries
  const [profile, bio, signalChains, midiMappings, settings, subscription] =
    await Promise.all([
      fetchUserProfile(convex, userId),
      fetchUserBio(convex, userId),
      fetchUserSignalChains(convex, userId),
      fetchUserMidiMappings(convex, userId),
      fetchUserSettings(convex, userId),
      fetchUserSubscription(convex, userId),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    profile,
    bio,
    signalChains,
    midiMappings,
    settings,
    subscription,
  };
}

/**
 * Download the exported data as a JSON file.
 */
export function downloadExportAsJSON(data: GDPRExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `amp-platform-data-export-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

// ── Account Deletion ──

/**
 * Request account deletion — removes all user data from the platform.
 * This is a destructive, irreversible operation.
 * Validates: Requirement 22.4
 */
export async function requestAccountDeletion(
  convex: ConvexReactClient,
  userId: UserId
): Promise<{ success: boolean; message: string }> {
  try {
    // The actual deletion is handled by a Convex mutation that cascades
    // through all user-owned tables. This client function triggers it.
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "auth:deleteAccount" as any,
      { userId }
    );

    return {
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again or contact support.",
    };
  }
}

// ── Internal Fetch Helpers ──

async function fetchUserProfile(
  convex: ConvexReactClient,
  userId: UserId
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await convex.query("auth:getUserProfile" as any, { userId });
    if (!profile) {
      return {
        email: "",
        displayName: "",
        tier: "free",
        createdAt: "",
        lastLoginAt: "",
      };
    }
    return {
      email: profile.email ?? "",
      displayName: profile.displayName ?? "",
      tier: profile.tier ?? "free",
      createdAt: new Date(profile.createdAt ?? 0).toISOString(),
      lastLoginAt: new Date(profile.lastLoginAt ?? 0).toISOString(),
    };
  } catch {
    return {
      email: "",
      displayName: "",
      tier: "free",
      createdAt: "",
      lastLoginAt: "",
    };
  }
}

async function fetchUserBio(
  convex: ConvexReactClient,
  userId: UserId
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bio = await convex.query("userSettings:getUserBio" as any, { userId });
    if (!bio) return null;
    return {
      firstName: bio.firstName,
      lastName: bio.lastName,
      bio: bio.bio,
    };
  } catch {
    return null;
  }
}

async function fetchUserSignalChains(
  convex: ConvexReactClient,
  userId: UserId
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chains = await convex.query("signalChains:getUserSignalChains" as any, { userId });
    if (!Array.isArray(chains)) return [];
    return chains.map((c: Record<string, unknown>) => ({
      name: (c.name as string) ?? "",
      config: c.config,
      createdAt: new Date((c.createdAt as number) ?? 0).toISOString(),
      updatedAt: new Date((c.updatedAt as number) ?? 0).toISOString(),
    }));
  } catch {
    return [];
  }
}

async function fetchUserMidiMappings(
  convex: ConvexReactClient,
  userId: UserId
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappings = await convex.query("midiMappings:getMappings" as any, { userId });
    if (!Array.isArray(mappings)) return [];
    return mappings.map((m: Record<string, unknown>) => ({
      channel: (m.channel as number) ?? 0,
      type: (m.type as string) ?? "",
      number: (m.number as number) ?? 0,
      targetType: (m.targetType as string) ?? "",
      targetConfig: m.targetConfig,
    }));
  } catch {
    return [];
  }
}

async function fetchUserSettings(
  convex: ConvexReactClient,
  userId: UserId
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await convex.query("userSettings:getSettings" as any, { userId });
    if (!settings) return null;
    return {
      audioInterfaceId: settings.audioInterfaceId,
      bufferSize: settings.bufferSize,
      sampleRate: settings.sampleRate,
      recordingFormat: settings.recordingFormat,
      recordingBitDepth: settings.recordingBitDepth,
      cpuPriority: settings.cpuPriority,
      gpuEnabled: settings.gpuEnabled,
      aiBlendLevel: settings.aiBlendLevel,
    };
  } catch {
    return null;
  }
}

async function fetchUserSubscription(
  convex: ConvexReactClient,
  userId: UserId
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = await convex.query("subscriptions:getUserSubscription" as any, { userId });
    if (!sub) return null;
    return {
      tier: (sub.tier as string) ?? "free",
      status: (sub.status as string) ?? "",
      currentPeriodEnd: new Date((sub.currentPeriodEnd as number) ?? 0).toISOString(),
      createdAt: new Date((sub.createdAt as number) ?? 0).toISOString(),
    };
  } catch {
    return null;
  }
}
