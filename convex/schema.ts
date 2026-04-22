import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Amplifier Tables ──
  ampList: defineTable({
    name: v.string(),
    brandRename: v.string(),
    channels: v.array(v.string()),
    preampStageCount: v.number(),
    powerAmpTubeType: v.string(),
    controls: v.array(
      v.object({
        name: v.string(),
        paramKey: v.string(),
        min: v.number(),
        max: v.number(),
        defaultValue: v.number(),
      })
    ),
    toggleSwitches: v.array(
      v.object({
        name: v.string(),
        paramKey: v.string(),
        defaultValue: v.boolean(),
      })
    ),
    visualConfig: v.any(),
  }).index("by_name", ["name"]),

  ampManufacturerToneValues: defineTable({
    ampId: v.id("ampList"),
    bass: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),
    middle: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),
    treble: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),
    presence: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),
    resonance: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),
  }).index("by_amp", ["ampId"]),

  preampToneValues: defineTable({
    ampId: v.id("ampList"),
    stageIndex: v.number(),
    gain: v.number(),
    frequencyResponse: v.array(v.number()),
    harmonicContent: v.array(v.number()),
  }).index("by_amp_stage", ["ampId", "stageIndex"]),

  powerAmpToneValues: defineTable({
    tubeType: v.string(),
    masterVolumeResponse: v.array(v.number()),
    biasDefault: v.number(),
    sagCoefficient: v.number(),
    voltageDefault: v.number(),
    compressionCurve: v.array(v.number()),
    dynamicRange: v.object({ min: v.number(), max: v.number() }),
  }).index("by_tube_type", ["tubeType"]),

  // ── FX Pedal Tables ──
  fxPedalList: defineTable({
    name: v.string(),
    brand: v.string(),
    category: v.string(),
    controls: v.array(
      v.object({
        name: v.string(),
        paramKey: v.string(),
        type: v.string(),
        min: v.number(),
        max: v.number(),
        defaultValue: v.number(),
      })
    ),
    tierRequired: v.string(),
    visualConfig: v.any(),
  })
    .index("by_brand", ["brand"])
    .index("by_category", ["category"]),

  fxPedalCircuitValues: defineTable({
    pedalId: v.id("fxPedalList"),
    circuitType: v.string(),
    componentValues: v.any(),
    transferFunction: v.array(v.number()),
  }).index("by_pedal", ["pedalId"]),

  fxCategoryValues: defineTable({
    name: v.string(),
    displayOrder: v.number(),
  }),

  fxManufacturerValues: defineTable({
    originalName: v.string(),
    brandRename: v.string(),
    logoSvgPath: v.string(),
  }),

  // ── Cabinet Tables ──
  cabList: defineTable({
    name: v.string(),
    speakerConfig: v.string(),
    speakerIds: v.array(v.id("speakerList")),
    visualConfig: v.any(),
  }).index("by_name", ["name"]),

  speakerList: defineTable({
    name: v.string(),
    frequencyResponse: v.array(v.number()),
    powerRating: v.number(),
  }),

  cabToneValues: defineTable({
    cabId: v.id("cabList"),
    depth: v.number(),
    dimension: v.number(),
    airSimulation: v.array(v.number()),
  }).index("by_cab", ["cabId"]),

  speakerToneValues: defineTable({
    speakerId: v.id("speakerList"),
    frequencySpectrum: v.array(v.number()),
    impedanceCurve: v.array(v.number()),
  }).index("by_speaker", ["speakerId"]),

  cabCombinedValues: defineTable({
    cabId: v.id("cabList"),
    irData: v.bytes(),
    sampleRate: v.number(),
  }).index("by_cab", ["cabId"]),

  // ── Microphone Tables ──
  micList: defineTable({
    name: v.string(),
    type: v.string(),
  }),

  micTypeToneValues: defineTable({
    micId: v.id("micList"),
    frequencyResponse: v.array(v.number()),
    polarPattern: v.string(),
    sensitivityDb: v.number(),
  }).index("by_mic", ["micId"]),

  // ── User Tables ──
  userProfiles: defineTable({
    email: v.string(),
    displayName: v.string(),
    passwordHash: v.string(),
    tier: v.string(),
    createdAt: v.number(),
    lastLoginAt: v.number(),
    failedLoginAttempts: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index("by_email", ["email"]),

  userBioInformation: defineTable({
    userId: v.id("userProfiles"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  savedUserSignalChain: defineTable({
    userId: v.id("userProfiles"),
    name: v.string(),
    config: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  userSignalChainValues: defineTable({
    chainId: v.id("savedUserSignalChain"),
    parameterKey: v.string(),
    parameterValue: v.any(),
  }).index("by_chain", ["chainId"]),

  // ── Subscription Tables ──
  subscriptions: defineTable({
    userId: v.id("userProfiles"),
    tier: v.string(),
    status: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ── Real-Time Tables (for session state) ──
  realTimeUserSignalChain: defineTable({
    userId: v.id("userProfiles"),
    sessionId: v.string(),
    currentState: v.any(),
    lastUpdated: v.number(),
  }).index("by_user_session", ["userId", "sessionId"]),

  micRealTimePositionValues: defineTable({
    sessionId: v.string(),
    userId: v.id("userProfiles"),
    x: v.number(),
    y: v.number(),
    z: v.number(),
    distance: v.number(),
    lastUpdated: v.number(),
  }).index("by_session", ["sessionId"]),

  // ── MIDI Mappings ──
  midiMappings: defineTable({
    userId: v.id("userProfiles"),
    channel: v.number(),
    type: v.string(),
    number: v.number(),
    targetType: v.string(),
    targetConfig: v.any(),
  }).index("by_user", ["userId"]),

  // ── Settings ──
  userSettings: defineTable({
    userId: v.id("userProfiles"),
    audioInterfaceId: v.optional(v.string()),
    bufferSize: v.optional(v.number()),
    sampleRate: v.optional(v.number()),
    recordingFormat: v.optional(v.string()),
    recordingBitDepth: v.optional(v.number()),
    cpuPriority: v.optional(v.string()),
    gpuEnabled: v.optional(v.boolean()),
    aiBlendLevel: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});
