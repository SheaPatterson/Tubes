import { mutation } from "./_generated/server";

/**
 * Seed the Convex database with all static data (amps, pedals, cabinets,
 * speakers, mics, brand renames, FX categories, power amp tube data).
 *
 * Run once via: npx convex run seed:seedAll
 *
 * Idempotent — checks if data already exists before inserting.
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // ── Guard: skip if already seeded ──
    const existingAmp = await ctx.db.query("ampList").first();
    if (existingAmp) {
      return { status: "already_seeded" };
    }

    // ═══════════════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════════════

    const baseControls = [
      { name: "Pre-Amp Gain", paramKey: "preampGain", min: 1, max: 10, defaultValue: 5 },
      { name: "Volume", paramKey: "volume", min: 1, max: 10, defaultValue: 5 },
      { name: "Master Volume", paramKey: "masterVolume", min: 1, max: 10, defaultValue: 5 },
      { name: "Master Gain", paramKey: "masterGain", min: 1, max: 10, defaultValue: 5 },
      { name: "Bass", paramKey: "bass", min: 1, max: 10, defaultValue: 5 },
      { name: "Middle", paramKey: "middle", min: 1, max: 10, defaultValue: 5 },
      { name: "Treble", paramKey: "treble", min: 1, max: 10, defaultValue: 5 },
      { name: "Tone", paramKey: "tone", min: 1, max: 10, defaultValue: 5 },
      { name: "Presence", paramKey: "presence", min: 1, max: 10, defaultValue: 5 },
      { name: "Resonance", paramKey: "resonance", min: 1, max: 10, defaultValue: 5 },
    ];

    function makeControls(overrides?: Record<string, number>) {
      return baseControls.map((c) => ({
        ...c,
        defaultValue: overrides?.[c.paramKey] ?? c.defaultValue,
      }));
    }

    // ═══════════════════════════════════════════════════════════
    // Amp Models (13 total)
    // ═══════════════════════════════════════════════════════════

    const amps = [
      {
        name: "Winston CHL",
        brandRename: "Winston",
        channels: ["clean", "crunch", "overdrive"],
        preampStageCount: 4,
        powerAmpTubeType: "EL34",
        controls: makeControls({ preampGain: 6, bass: 5, middle: 6, treble: 6, presence: 5 }),
        toggleSwitches: [
          { name: "Tone Shift", paramKey: "toneShift", defaultValue: false },
          { name: "Deep", paramKey: "deep", defaultValue: false },
          { name: "Mid Boost", paramKey: "midBoost", defaultValue: false },
          { name: "Mid Cut", paramKey: "midCut", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: false },
          { name: "Diode", paramKey: "diode", defaultValue: false },
        ],
        visualConfig: { panelColor: "#1a1a1a", knobStyle: "chicken-head", fontFamily: "serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "US Steel Plate",
        brandRename: "US Steel",
        channels: ["clean", "crunch", "overdrive"],
        preampStageCount: 5,
        powerAmpTubeType: "6L6",
        controls: makeControls({ preampGain: 7, bass: 6, middle: 5, treble: 7, presence: 6 }),
        toggleSwitches: [
          { name: "Deep", paramKey: "deep", defaultValue: false },
          { name: "Mid Cut", paramKey: "midCut", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: true },
          { name: "Diode", paramKey: "diode", defaultValue: false },
        ],
        visualConfig: { panelColor: "#2b2b2b", knobStyle: "pointer", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Twanger Banger",
        brandRename: "Twanger",
        channels: ["clean", "crunch"],
        preampStageCount: 3,
        powerAmpTubeType: "6L6",
        controls: makeControls({ preampGain: 4, bass: 6, middle: 4, treble: 7, tone: 6, presence: 4 }),
        toggleSwitches: [
          { name: "Deep", paramKey: "deep", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#d4a76a", knobStyle: "chicken-head", fontFamily: "serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Twanger Twin",
        brandRename: "Twanger",
        channels: ["clean", "crunch"],
        preampStageCount: 4,
        powerAmpTubeType: "6L6",
        controls: makeControls({ preampGain: 3, bass: 5, middle: 5, treble: 6, tone: 5, volume: 4, presence: 5 }),
        toggleSwitches: [
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#2a2a2a", knobStyle: "chicken-head", fontFamily: "serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Twanger Deluxe",
        brandRename: "Twanger",
        channels: ["clean", "crunch"],
        preampStageCount: 3,
        powerAmpTubeType: "6L6",
        controls: makeControls({ preampGain: 4, bass: 5, middle: 5, treble: 6, tone: 5, volume: 5 }),
        toggleSwitches: [
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#1a1a1a", knobStyle: "chicken-head", fontFamily: "serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Fizzle 0505",
        brandRename: "Fizzle",
        channels: ["crunch", "overdrive"],
        preampStageCount: 5,
        powerAmpTubeType: "6L6",
        controls: makeControls({ preampGain: 8, bass: 5, middle: 6, treble: 7, presence: 6, resonance: 5 }),
        toggleSwitches: [
          { name: "Mid Boost", paramKey: "midBoost", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#0a0a0a", knobStyle: "pointer", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Fuzzy AcidTrip",
        brandRename: "Fuzzy",
        channels: ["clean", "overdrive"],
        preampStageCount: 4,
        powerAmpTubeType: "EL34",
        controls: makeControls({ preampGain: 6, bass: 6, middle: 5, treble: 5, volume: 5 }),
        toggleSwitches: [],
        visualConfig: { panelColor: "#e85d00", knobStyle: "chicken-head", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Blitzkrieg Warfare",
        brandRename: "Blitzkrieg",
        channels: ["clean", "crunch", "overdrive"],
        preampStageCount: 4,
        powerAmpTubeType: "EL34",
        controls: makeControls({ preampGain: 7, bass: 5, middle: 6, treble: 6, presence: 6 }),
        toggleSwitches: [
          { name: "Deep", paramKey: "deep", defaultValue: true },
          { name: "Mid Boost", paramKey: "midBoost", defaultValue: false },
          { name: "Mid Cut", paramKey: "midCut", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: false },
        ],
        visualConfig: { panelColor: "#8b0000", knobStyle: "dome", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Berlin Wall",
        brandRename: "Berlin",
        channels: ["clean", "crunch", "overdrive"],
        preampStageCount: 5,
        powerAmpTubeType: "KT88",
        controls: makeControls({ preampGain: 7, bass: 5, middle: 6, treble: 6, presence: 6, resonance: 5 }),
        toggleSwitches: [
          { name: "Tone Shift", paramKey: "toneShift", defaultValue: false },
          { name: "Deep", paramKey: "deep", defaultValue: true },
          { name: "Mid Boost", paramKey: "midBoost", defaultValue: false },
          { name: "Mid Cut", paramKey: "midCut", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: true },
          { name: "Diode", paramKey: "diode", defaultValue: true },
        ],
        visualConfig: { panelColor: "#0d0d0d", knobStyle: "dome", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Chimera 30",
        brandRename: "Chimera",
        channels: ["clean", "crunch"],
        preampStageCount: 3,
        powerAmpTubeType: "EL84",
        controls: makeControls({ preampGain: 5, bass: 5, middle: 5, treble: 6, tone: 7, volume: 5 }),
        toggleSwitches: [
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#c4a265", knobStyle: "chicken-head", fontFamily: "serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Soldano Overdrive",
        brandRename: "Soldano",
        channels: ["clean", "crunch", "overdrive"],
        preampStageCount: 5,
        powerAmpTubeType: "EL34",
        controls: makeControls({ preampGain: 7, bass: 5, middle: 6, treble: 6, presence: 6, masterVolume: 4 }),
        toggleSwitches: [
          { name: "Deep", paramKey: "deep", defaultValue: true },
          { name: "Mid Boost", paramKey: "midBoost", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#4a0e0e", knobStyle: "dome", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Hiwatt Custom",
        brandRename: "Hiwatt",
        channels: ["clean", "crunch"],
        preampStageCount: 4,
        powerAmpTubeType: "EL34",
        controls: makeControls({ preampGain: 5, bass: 5, middle: 6, treble: 5, presence: 5, masterVolume: 5 }),
        toggleSwitches: [
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#1e3a5f", knobStyle: "chicken-head", fontFamily: "sans-serif", logoSvgPath: "/icons/logo.svg" },
      },
      {
        name: "Matchless Lightning",
        brandRename: "Matchless",
        channels: ["clean", "crunch"],
        preampStageCount: 3,
        powerAmpTubeType: "EL84",
        controls: makeControls({ preampGain: 5, bass: 5, middle: 5, treble: 6, tone: 6, volume: 5 }),
        toggleSwitches: [
          { name: "Mid Cut", paramKey: "midCut", defaultValue: false },
          { name: "Bright", paramKey: "bright", defaultValue: true },
        ],
        visualConfig: { panelColor: "#3d2b1f", knobStyle: "chicken-head", fontFamily: "serif", logoSvgPath: "/icons/logo.svg" },
      },
    ];

    for (const amp of amps) {
      await ctx.db.insert("ampList", amp);
    }

    // ═══════════════════════════════════════════════════════════
    // FX Pedals (27 total)
    // ═══════════════════════════════════════════════════════════

    const pedals = [
      // MAC (MXR)
      { name: "Super Comp", brand: "MAC", category: "compression", controls: [{ name: "Output", paramKey: "output", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Sensitivity", paramKey: "sensitivity", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Attack", paramKey: "attack", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "free", visualConfig: { bodyColor: "#ff4444" } },
      { name: "Dyna Comp", brand: "MAC", category: "compression", controls: [{ name: "Output", paramKey: "output", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Sensitivity", paramKey: "sensitivity", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "free", visualConfig: { bodyColor: "#ff6600" } },
      { name: "SmartGate", brand: "MAC", category: "gate", controls: [{ name: "Trigger", paramKey: "trigger", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Release", paramKey: "release", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Mode", paramKey: "mode", type: "switch", min: 0, max: 2, defaultValue: 0 }], tierRequired: "classic", visualConfig: { bodyColor: "#00cc44" } },
      { name: "Phase 90", brand: "MAC", category: "modulation", controls: [{ name: "Speed", paramKey: "speed", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#ff8800" } },
      { name: "Distortion+", brand: "MAC", category: "distortion", controls: [{ name: "Output", paramKey: "output", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Distortion", paramKey: "distortion", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#ffcc00" } },
      { name: "Carbon Delay", brand: "MAC", category: "delay", controls: [{ name: "Delay", paramKey: "delay", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Regen", paramKey: "regen", type: "knob", min: 0, max: 10, defaultValue: 4 }, { name: "Mix", paramKey: "mix", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Mod", paramKey: "mod", type: "knob", min: 0, max: 10, defaultValue: 3 }], tierRequired: "classic", visualConfig: { bodyColor: "#333333" } },
      { name: "Timmy", brand: "MAC", category: "overdrive", controls: [{ name: "Volume", paramKey: "volume", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Gain", paramKey: "gain", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Bass", paramKey: "bass", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Treble", paramKey: "treble", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#e8e0d0" } },
      // KING (BOSS)
      { name: "Super Overdrive", brand: "KING", category: "overdrive", controls: [{ name: "Level", paramKey: "level", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Tone", paramKey: "tone", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Drive", paramKey: "drive", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "free", visualConfig: { bodyColor: "#ffaa00" } },
      { name: "Distortion", brand: "KING", category: "distortion", controls: [{ name: "Level", paramKey: "level", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Tone", paramKey: "tone", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Distortion", paramKey: "distortion", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#ff6600" } },
      { name: "Turbo Distortion", brand: "KING", category: "distortion", controls: [{ name: "Level", paramKey: "level", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Tone", paramKey: "tone", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Distortion", paramKey: "distortion", type: "knob", min: 0, max: 10, defaultValue: 7 }, { name: "Turbo", paramKey: "turbo", type: "switch", min: 0, max: 1, defaultValue: 0 }], tierRequired: "classic", visualConfig: { bodyColor: "#cc3300" } },
      { name: "Digital Delay", brand: "KING", category: "delay", controls: [{ name: "E.Level", paramKey: "effectLevel", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "F.Back", paramKey: "feedback", type: "knob", min: 0, max: 10, defaultValue: 4 }, { name: "D.Time", paramKey: "delayTime", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#0066cc" } },
      { name: "EQ", brand: "KING", category: "eq", controls: [{ name: "100Hz", paramKey: "band100", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "200Hz", paramKey: "band200", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "400Hz", paramKey: "band400", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "800Hz", paramKey: "band800", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "1.6kHz", paramKey: "band1600", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "3.2kHz", paramKey: "band3200", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "6.4kHz", paramKey: "band6400", type: "slider", min: -12, max: 12, defaultValue: 0 }, { name: "Level", paramKey: "level", type: "knob", min: -12, max: 12, defaultValue: 0 }], tierRequired: "classic", visualConfig: { bodyColor: "#ffffff" } },
      { name: "Chorus", brand: "KING", category: "modulation", controls: [{ name: "E.Level", paramKey: "effectLevel", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Rate", paramKey: "rate", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Depth", paramKey: "depth", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#66ccff" } },
      { name: "Flanger", brand: "KING", category: "modulation", controls: [{ name: "Rate", paramKey: "rate", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Depth", paramKey: "depth", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Manual", paramKey: "manual", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Resonance", paramKey: "resonance", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#cc66ff" } },
      { name: "CE-2 Chorus", brand: "KING", category: "modulation", controls: [{ name: "Rate", paramKey: "rate", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Depth", paramKey: "depth", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#4488cc" } },
      { name: "ME-90", brand: "KING", category: "multi", controls: [{ name: "Comp", paramKey: "comp", type: "knob", min: 0, max: 10, defaultValue: 0 }, { name: "OD/DS", paramKey: "odDs", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "EQ Low", paramKey: "eqLow", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "EQ High", paramKey: "eqHigh", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Mod", paramKey: "mod", type: "knob", min: 0, max: 10, defaultValue: 0 }, { name: "Delay", paramKey: "delay", type: "knob", min: 0, max: 10, defaultValue: 0 }, { name: "Reverb", paramKey: "reverb", type: "knob", min: 0, max: 10, defaultValue: 3 }], tierRequired: "next_gen", visualConfig: { bodyColor: "#222222" } },
      // Manhattan (Electro-Harmonix)
      { name: "Big Muff", brand: "Manhattan", category: "distortion", controls: [{ name: "Volume", paramKey: "volume", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Tone", paramKey: "tone", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Sustain", paramKey: "sustain", type: "knob", min: 0, max: 10, defaultValue: 7 }], tierRequired: "classic", visualConfig: { bodyColor: "#cc0000" } },
      { name: "Small Clone", brand: "Manhattan", category: "modulation", controls: [{ name: "Rate", paramKey: "rate", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Depth", paramKey: "depth", type: "switch", min: 0, max: 1, defaultValue: 0 }], tierRequired: "classic", visualConfig: { bodyColor: "#6699cc" } },
      // TOKYO (Ibanez)
      { name: "Tube Screamer", brand: "TOKYO", category: "overdrive", controls: [{ name: "Drive", paramKey: "drive", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Tone", paramKey: "tone", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Level", paramKey: "level", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "free", visualConfig: { bodyColor: "#00cc44" } },
      // Boutique / Independent
      { name: "Golden Horse", brand: "MAC", category: "overdrive", controls: [{ name: "Gain", paramKey: "gain", type: "knob", min: 0, max: 10, defaultValue: 3 }, { name: "Treble", paramKey: "treble", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Output", paramKey: "output", type: "knob", min: 0, max: 10, defaultValue: 6 }], tierRequired: "classic", visualConfig: { bodyColor: "#c9a84c" } },
      { name: "Rat", brand: "MAC", category: "distortion", controls: [{ name: "Distortion", paramKey: "distortion", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Filter", paramKey: "filter", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Volume", paramKey: "volume", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#1a1a1a" } },
      { name: "Fuzz Face", brand: "MAC", category: "distortion", controls: [{ name: "Volume", paramKey: "volume", type: "knob", min: 0, max: 10, defaultValue: 7 }, { name: "Fuzz", paramKey: "fuzz", type: "knob", min: 0, max: 10, defaultValue: 8 }], tierRequired: "classic", visualConfig: { bodyColor: "#4169e1" } },
      { name: "Rangemaster", brand: "MAC", category: "overdrive", controls: [{ name: "Range", paramKey: "range", type: "knob", min: 0, max: 10, defaultValue: 7 }], tierRequired: "classic", visualConfig: { bodyColor: "#8b8b8b" } },
      { name: "Crybaby Wah", brand: "MAC", category: "modulation", controls: [{ name: "Position", paramKey: "position", type: "slider", min: 0, max: 10, defaultValue: 5 }, { name: "Q", paramKey: "q", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Range", paramKey: "range", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#2a2a2a" } },
      { name: "V847 Wah", brand: "MAC", category: "modulation", controls: [{ name: "Position", paramKey: "position", type: "slider", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#1a1a1a" } },
      { name: "Echo Delay", brand: "MAC", category: "delay", controls: [{ name: "Time", paramKey: "time", type: "knob", min: 0, max: 10, defaultValue: 5 }, { name: "Feedback", paramKey: "feedback", type: "knob", min: 0, max: 10, defaultValue: 4 }, { name: "Mix", paramKey: "mix", type: "knob", min: 0, max: 10, defaultValue: 5 }], tierRequired: "classic", visualConfig: { bodyColor: "#556b2f" } },
    ];

    for (const pedal of pedals) {
      await ctx.db.insert("fxPedalList", pedal);
    }

    // ═══════════════════════════════════════════════════════════
    // FX Categories
    // ═══════════════════════════════════════════════════════════

    const categories = [
      { name: "overdrive", displayOrder: 1 },
      { name: "distortion", displayOrder: 2 },
      { name: "fuzz", displayOrder: 3 },
      { name: "compression", displayOrder: 4 },
      { name: "eq", displayOrder: 5 },
      { name: "gate", displayOrder: 6 },
      { name: "modulation", displayOrder: 7 },
      { name: "delay", displayOrder: 8 },
      { name: "multi", displayOrder: 9 },
    ];

    for (const cat of categories) {
      await ctx.db.insert("fxCategoryValues", cat);
    }

    // ═══════════════════════════════════════════════════════════
    // FX Manufacturer Brand Renames
    // ═══════════════════════════════════════════════════════════

    const manufacturers = [
      { originalName: "MXR", brandRename: "MAC", logoSvgPath: "/icons/logo-mac.svg" },
      { originalName: "BOSS", brandRename: "KING", logoSvgPath: "/icons/logo-king.svg" },
      { originalName: "Electro-Harmonix", brandRename: "Manhattan", logoSvgPath: "/icons/logo-manhattan.svg" },
      { originalName: "Ibanez", brandRename: "TOKYO", logoSvgPath: "/icons/logo-tokyo.svg" },
    ];

    for (const mfr of manufacturers) {
      await ctx.db.insert("fxManufacturerValues", mfr);
    }

    // ═══════════════════════════════════════════════════════════
    // Speakers (insert first, cabinets reference them)
    // ═══════════════════════════════════════════════════════════

    const speakerDefs = [
      { name: "G12T-75", frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.7], powerRating: 75 },
      { name: "Vintage 30", frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
      { name: "Jensen P12R", frequencyResponse: [80, 0.75, 200, 0.95, 800, 1.0, 2500, 1.1, 5000, 1.15, 8000, 0.85], powerRating: 25 },
      { name: "Alnico Blue", frequencyResponse: [80, 0.8, 200, 0.95, 800, 1.1, 2500, 1.3, 5000, 1.1, 8000, 0.75], powerRating: 15 },
      { name: "JBL D120F", frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.1, 8000, 0.8], powerRating: 100 },
      { name: "Jensen P10R", frequencyResponse: [80, 0.7, 200, 0.9, 800, 1.0, 2500, 1.15, 5000, 1.2, 8000, 0.9], powerRating: 25 },
      { name: "Jensen C12N", frequencyResponse: [80, 0.75, 200, 0.95, 800, 1.05, 2500, 1.15, 5000, 1.1, 8000, 0.8], powerRating: 50 },
      { name: "Fane Crescendo", frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.05, 2500, 1.1, 5000, 0.95, 8000, 0.7], powerRating: 50 },
      { name: "G12H-30", frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.65], powerRating: 30 },
      { name: "G12M Greenback", frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.65], powerRating: 25 },
    ];

    const speakerIds: Record<string, any> = {};
    for (const spk of speakerDefs) {
      speakerIds[spk.name] = await ctx.db.insert("speakerList", spk);
    }

    // ═══════════════════════════════════════════════════════════
    // Cabinets (13 total)
    // ═══════════════════════════════════════════════════════════

    const cabinets = [
      { name: "Winston 4x12", speakerConfig: "4x12", speakerName: "G12T-75", count: 4, visualConfig: { bodyColor: "#1a1a1a", grillPattern: "basket-weave" } },
      { name: "Winston 4x12V", speakerConfig: "4x12", speakerName: "Vintage 30", count: 4, visualConfig: { bodyColor: "#1a1a1a", grillPattern: "basket-weave" } },
      { name: "Winston 2x12V", speakerConfig: "2x12", speakerName: "Vintage 30", count: 2, visualConfig: { bodyColor: "#1a1a1a", grillPattern: "basket-weave" } },
      { name: "Fuzzy 4x12", speakerConfig: "4x12", speakerName: "Vintage 30", count: 4, visualConfig: { bodyColor: "#e85d00", grillPattern: "diamond-mesh" } },
      { name: "Fuzzy 2x12", speakerConfig: "2x12", speakerName: "Vintage 30", count: 2, visualConfig: { bodyColor: "#e85d00", grillPattern: "diamond-mesh" } },
      { name: "US Steel 4x12", speakerConfig: "4x12", speakerName: "Vintage 30", count: 4, visualConfig: { bodyColor: "#2a2a2a", grillPattern: "wicker" } },
      { name: "Twanger 1", speakerConfig: "1x12", speakerName: "Jensen P12R", count: 1, visualConfig: { bodyColor: "#d4a76a", grillPattern: "tweed-cloth" } },
      { name: "Twanger Twin 2x12", speakerConfig: "2x12", speakerName: "JBL D120F", count: 2, visualConfig: { bodyColor: "#1a1a1a", grillPattern: "silverface-cloth" } },
      { name: "Twanger Blackface 1x12", speakerConfig: "1x12", speakerName: "Jensen C12N", count: 1, visualConfig: { bodyColor: "#1a1a1a", grillPattern: "silverface-cloth" } },
      { name: "Twanger Bassman 4x10", speakerConfig: "4x10", speakerName: "Jensen P10R", count: 4, visualConfig: { bodyColor: "#d4a76a", grillPattern: "tweed-cloth" } },
      { name: "Chimera 2x12", speakerConfig: "2x12", speakerName: "Alnico Blue", count: 2, visualConfig: { bodyColor: "#c4a265", grillPattern: "diamond-mesh" } },
      { name: "Hiwatt 4x12", speakerConfig: "4x12", speakerName: "Fane Crescendo", count: 4, visualConfig: { bodyColor: "#1e3a5f", grillPattern: "basket-weave" } },
      { name: "Matchless 2x12", speakerConfig: "2x12", speakerName: "G12H-30", count: 2, visualConfig: { bodyColor: "#3d2b1f", grillPattern: "basket-weave" } },
    ];

    for (const cab of cabinets) {
      const spkId = speakerIds[cab.speakerName];
      const speakerIdArray = Array(cab.count).fill(spkId);
      await ctx.db.insert("cabList", {
        name: cab.name,
        speakerConfig: cab.speakerConfig,
        speakerIds: speakerIdArray,
        visualConfig: cab.visualConfig,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Microphones (8 total)
    // ═══════════════════════════════════════════════════════════

    const mics = [
      { name: "SM57 Dynamic", type: "dynamic" },
      { name: "MD421 Dynamic", type: "dynamic" },
      { name: "SM58 Dynamic", type: "dynamic" },
      { name: "U67 Condenser", type: "condenser" },
      { name: "AT4050 Condenser", type: "condenser" },
      { name: "U87 Condenser", type: "condenser" },
      { name: "Royer R-121 Ribbon", type: "ribbon" },
      { name: "Classic Ribbon", type: "ribbon" },
    ];

    const micFreqData = [
      { frequencyResponse: [20, 0.4, 50, 0.6, 100, 0.85, 250, 1.0, 500, 1.0, 1000, 1.0, 2000, 1.1, 4000, 1.2, 6000, 1.25, 8000, 1.1, 10000, 0.9, 12000, 0.6, 16000, 0.3], polarPattern: "cardioid", sensitivityDb: -56 },
      { frequencyResponse: [20, 0.5, 50, 0.7, 100, 0.9, 250, 1.0, 500, 1.0, 1000, 1.0, 2000, 1.05, 4000, 1.1, 6000, 1.0, 8000, 0.9, 10000, 0.8, 12000, 0.65, 16000, 0.4], polarPattern: "cardioid", sensitivityDb: -54 },
      { frequencyResponse: [20, 0.3, 50, 0.5, 100, 0.8, 250, 1.0, 500, 1.0, 1000, 1.0, 2000, 1.05, 4000, 1.1, 6000, 1.15, 8000, 1.0, 10000, 0.8, 12000, 0.5, 16000, 0.25], polarPattern: "cardioid", sensitivityDb: -54.5 },
      { frequencyResponse: [20, 0.85, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0, 1000, 1.05, 2000, 1.1, 4000, 1.15, 6000, 1.1, 8000, 1.05, 10000, 1.0, 12000, 0.95, 16000, 0.85], polarPattern: "cardioid", sensitivityDb: -33 },
      { frequencyResponse: [20, 0.8, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0, 1000, 1.0, 2000, 1.05, 4000, 1.1, 6000, 1.15, 8000, 1.2, 10000, 1.15, 12000, 1.05, 16000, 0.9], polarPattern: "cardioid", sensitivityDb: -36 },
      { frequencyResponse: [20, 0.85, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0, 1000, 1.05, 2000, 1.1, 4000, 1.12, 6000, 1.08, 8000, 1.0, 10000, 0.95, 12000, 0.9, 16000, 0.8], polarPattern: "cardioid", sensitivityDb: -31 },
      { frequencyResponse: [20, 0.7, 50, 0.85, 100, 0.95, 250, 1.0, 500, 1.0, 1000, 1.0, 2000, 0.98, 4000, 0.9, 6000, 0.8, 8000, 0.7, 10000, 0.6, 12000, 0.5, 16000, 0.35], polarPattern: "figure-8", sensitivityDb: -47 },
      { frequencyResponse: [20, 0.7, 50, 0.85, 100, 0.95, 250, 1.0, 500, 1.0, 1000, 1.0, 2000, 0.95, 4000, 0.85, 8000, 0.7, 12000, 0.55, 16000, 0.4], polarPattern: "figure-8", sensitivityDb: -50 },
    ];

    for (let i = 0; i < mics.length; i++) {
      const micId = await ctx.db.insert("micList", mics[i]);
      await ctx.db.insert("micTypeToneValues", {
        micId,
        ...micFreqData[i],
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Power Amp Tube Type Tone Values
    // ═══════════════════════════════════════════════════════════

    const tubeTypes = [
      { tubeType: "KT88", masterVolumeResponse: [0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.92, 0.96, 0.98, 0.99, 1.0], biasDefault: 0.65, sagCoefficient: 0.15, voltageDefault: 0.85, compressionCurve: [0.6, 4.0], dynamicRange: { min: 0.01, max: 1.0 } },
      { tubeType: "6L6", masterVolumeResponse: [0, 0.08, 0.25, 0.45, 0.65, 0.8, 0.9, 0.95, 0.97, 0.99, 1.0], biasDefault: 0.60, sagCoefficient: 0.20, voltageDefault: 0.80, compressionCurve: [0.55, 3.5], dynamicRange: { min: 0.01, max: 1.0 } },
      { tubeType: "EL34", masterVolumeResponse: [0, 0.12, 0.3, 0.5, 0.68, 0.82, 0.9, 0.95, 0.97, 0.99, 1.0], biasDefault: 0.55, sagCoefficient: 0.25, voltageDefault: 0.75, compressionCurve: [0.50, 3.0], dynamicRange: { min: 0.01, max: 1.0 } },
      { tubeType: "EL84", masterVolumeResponse: [0, 0.15, 0.35, 0.55, 0.72, 0.85, 0.92, 0.96, 0.98, 0.99, 1.0], biasDefault: 0.50, sagCoefficient: 0.35, voltageDefault: 0.70, compressionCurve: [0.45, 2.5], dynamicRange: { min: 0.02, max: 1.0 } },
      { tubeType: "12BH7", masterVolumeResponse: [0, 0.1, 0.28, 0.48, 0.66, 0.8, 0.88, 0.93, 0.96, 0.98, 1.0], biasDefault: 0.55, sagCoefficient: 0.30, voltageDefault: 0.72, compressionCurve: [0.48, 2.8], dynamicRange: { min: 0.02, max: 1.0 } },
      { tubeType: "12AU7", masterVolumeResponse: [0, 0.12, 0.3, 0.5, 0.65, 0.78, 0.86, 0.92, 0.95, 0.98, 1.0], biasDefault: 0.45, sagCoefficient: 0.40, voltageDefault: 0.65, compressionCurve: [0.40, 2.0], dynamicRange: { min: 0.03, max: 1.0 } },
    ];

    for (const tube of tubeTypes) {
      await ctx.db.insert("powerAmpToneValues", tube);
    }

    return {
      status: "seeded",
      counts: {
        amps: amps.length,
        pedals: pedals.length,
        cabinets: cabinets.length,
        speakers: speakerDefs.length,
        mics: mics.length,
        tubeTypes: tubeTypes.length,
        categories: categories.length,
        manufacturers: manufacturers.length,
      },
    };
  },
});

/**
 * Clear all seeded data so seedAll can be re-run.
 * Use with caution — this deletes all catalog data.
 *
 * Run via: npx convex run seed:clearAll
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "ampList",
      "ampManufacturerToneValues",
      "preampToneValues",
      "powerAmpToneValues",
      "fxPedalList",
      "fxPedalCircuitValues",
      "fxCategoryValues",
      "fxManufacturerValues",
      "cabList",
      "speakerList",
      "cabToneValues",
      "speakerToneValues",
      "cabCombinedValues",
      "micList",
      "micTypeToneValues",
    ] as const;

    let totalDeleted = 0;
    for (const table of tables) {
      // Loop until table is empty (handles tables > 500 rows)
      let batch = await ctx.db.query(table).take(500);
      while (batch.length > 0) {
        for (const doc of batch) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
        batch = await ctx.db.query(table).take(500);
      }
    }

    return { status: "cleared", totalDeleted };
  },
});
