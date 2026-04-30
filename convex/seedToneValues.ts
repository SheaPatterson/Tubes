import { mutation } from "./_generated/server";

/**
 * Seed the DSP tone value tables that drive the AudioWorklet processors.
 * Must be run AFTER seed:seedAll since it references amp/pedal/cab/speaker IDs.
 *
 * Run via: npx convex run seedToneValues:seedToneValues
 *
 * Populates:
 *   - ampManufacturerToneValues (per-amp EQ center frequencies)
 *   - preampToneValues (per-amp, per-stage gain curves)
 *   - fxPedalCircuitValues (per-pedal circuit component data)
 *   - cabToneValues (cabinet body resonance)
 *   - speakerToneValues (speaker impedance curves)
 */
export const seedToneValues = mutation({
  args: {},
  handler: async (ctx) => {
    // Guard: skip if already seeded
    const existing = await ctx.db.query("ampManufacturerToneValues").first();
    if (existing) {
      return { status: "already_seeded" };
    }

    // ── Lookup all amps by name ──
    const allAmps = await ctx.db.query("ampList").collect();
    const ampByName: Record<string, any> = {};
    for (const amp of allAmps) {
      ampByName[amp.name] = amp;
    }

    if (allAmps.length === 0) {
      return { status: "error", message: "Run seed:seedAll first" };
    }

    // ═══════════════════════════════════════════════════════════
    // ampManufacturerToneValues — per-amp EQ center frequencies
    // These define the tone stack character for each amp model.
    // ═══════════════════════════════════════════════════════════

    const toneStackDefaults = {
      bass: { frequency: 100, gain: 0, q: 0.7 },
      middle: { frequency: 650, gain: 0, q: 1.0 },
      treble: { frequency: 3200, gain: 0, q: 0.7 },
      presence: { frequency: 5000, gain: 0, q: 0.8 },
      resonance: { frequency: 80, gain: 0, q: 0.5 },
    };

    // Manufacturer-specific tone stack voicings
    const ampToneStacks: Record<string, typeof toneStackDefaults> = {
      "Winston CHL": {
        bass: { frequency: 90, gain: 0, q: 0.8 },
        middle: { frequency: 700, gain: 0, q: 1.2 },
        treble: { frequency: 3500, gain: 0, q: 0.7 },
        presence: { frequency: 5500, gain: 0, q: 0.9 },
        resonance: { frequency: 75, gain: 0, q: 0.5 },
      },
      "US Steel Plate": {
        bass: { frequency: 80, gain: 0, q: 0.6 },
        middle: { frequency: 600, gain: 0, q: 0.9 },
        treble: { frequency: 3000, gain: 0, q: 0.8 },
        presence: { frequency: 5000, gain: 0, q: 1.0 },
        resonance: { frequency: 70, gain: 0, q: 0.6 },
      },
      "Twanger Banger": {
        bass: { frequency: 100, gain: 0, q: 0.7 },
        middle: { frequency: 650, gain: 0, q: 0.8 },
        treble: { frequency: 3200, gain: 0, q: 0.6 },
        presence: { frequency: 4500, gain: 0, q: 0.7 },
        resonance: { frequency: 90, gain: 0, q: 0.5 },
      },
      "Twanger Twin": {
        bass: { frequency: 100, gain: 0, q: 0.7 },
        middle: { frequency: 700, gain: 0, q: 0.8 },
        treble: { frequency: 3500, gain: 0, q: 0.6 },
        presence: { frequency: 5000, gain: 0, q: 0.7 },
        resonance: { frequency: 85, gain: 0, q: 0.5 },
      },
      "Twanger Deluxe": {
        bass: { frequency: 100, gain: 0, q: 0.7 },
        middle: { frequency: 680, gain: 0, q: 0.8 },
        treble: { frequency: 3300, gain: 0, q: 0.6 },
        presence: { frequency: 4800, gain: 0, q: 0.7 },
        resonance: { frequency: 88, gain: 0, q: 0.5 },
      },
      "Fizzle 0505": {
        bass: { frequency: 85, gain: 0, q: 0.7 },
        middle: { frequency: 750, gain: 0, q: 1.4 },
        treble: { frequency: 3800, gain: 0, q: 0.8 },
        presence: { frequency: 6000, gain: 0, q: 1.0 },
        resonance: { frequency: 65, gain: 0, q: 0.6 },
      },
      "Fuzzy AcidTrip": {
        bass: { frequency: 110, gain: 0, q: 0.6 },
        middle: { frequency: 600, gain: 0, q: 0.9 },
        treble: { frequency: 2800, gain: 0, q: 0.7 },
        presence: { frequency: 4500, gain: 0, q: 0.8 },
        resonance: { frequency: 95, gain: 0, q: 0.5 },
      },
      "Blitzkrieg Warfare": {
        bass: { frequency: 85, gain: 0, q: 0.8 },
        middle: { frequency: 700, gain: 0, q: 1.3 },
        treble: { frequency: 3600, gain: 0, q: 0.8 },
        presence: { frequency: 5800, gain: 0, q: 1.0 },
        resonance: { frequency: 70, gain: 0, q: 0.6 },
      },
      "Berlin Wall": {
        bass: { frequency: 80, gain: 0, q: 0.7 },
        middle: { frequency: 680, gain: 0, q: 1.2 },
        treble: { frequency: 3400, gain: 0, q: 0.9 },
        presence: { frequency: 5500, gain: 0, q: 1.1 },
        resonance: { frequency: 65, gain: 0, q: 0.7 },
      },
      "Chimera 30": {
        bass: { frequency: 120, gain: 0, q: 0.6 },
        middle: { frequency: 800, gain: 0, q: 0.7 },
        treble: { frequency: 4000, gain: 0, q: 0.5 },
        presence: { frequency: 6000, gain: 0, q: 0.6 },
        resonance: { frequency: 100, gain: 0, q: 0.4 },
      },
      "Soldano Overdrive": {
        bass: { frequency: 85, gain: 0, q: 0.8 },
        middle: { frequency: 720, gain: 0, q: 1.3 },
        treble: { frequency: 3600, gain: 0, q: 0.8 },
        presence: { frequency: 5600, gain: 0, q: 1.0 },
        resonance: { frequency: 70, gain: 0, q: 0.6 },
      },
      "Hiwatt Custom": {
        bass: { frequency: 95, gain: 0, q: 0.7 },
        middle: { frequency: 650, gain: 0, q: 1.0 },
        treble: { frequency: 3200, gain: 0, q: 0.7 },
        presence: { frequency: 5200, gain: 0, q: 0.9 },
        resonance: { frequency: 80, gain: 0, q: 0.5 },
      },
      "Matchless Lightning": {
        bass: { frequency: 115, gain: 0, q: 0.6 },
        middle: { frequency: 780, gain: 0, q: 0.8 },
        treble: { frequency: 3800, gain: 0, q: 0.5 },
        presence: { frequency: 5800, gain: 0, q: 0.6 },
        resonance: { frequency: 95, gain: 0, q: 0.4 },
      },
    };

    for (const amp of allAmps) {
      const toneStack = ampToneStacks[amp.name] ?? toneStackDefaults;
      await ctx.db.insert("ampManufacturerToneValues", {
        ampId: amp._id,
        ...toneStack,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // preampToneValues — per-amp, per-stage gain + frequency curves
    // ═══════════════════════════════════════════════════════════

    for (const amp of allAmps) {
      const stageCount = amp.preampStageCount ?? 3;
      for (let i = 0; i < stageCount; i++) {
        // Each successive stage adds more harmonic content and gain
        const stageGain = 0.6 + (i * 0.15);
        // Frequency response: pairs of [freq, amplitude] — progressive high-freq rolloff per stage
        const rolloff = 1.0 - (i * 0.05);
        await ctx.db.insert("preampToneValues", {
          ampId: amp._id,
          stageIndex: i,
          gain: stageGain,
          frequencyResponse: [
            80, 0.9, 200, 1.0, 800, 1.0, 2000, rolloff,
            4000, rolloff * 0.9, 8000, rolloff * 0.7,
          ],
          harmonicContent: [
            1.0,                          // fundamental
            0.3 + (i * 0.1),             // 2nd harmonic (grows per stage)
            0.1 + (i * 0.08),            // 3rd harmonic
            0.05 + (i * 0.04),           // 4th harmonic
          ],
        });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // fxPedalCircuitValues — per-pedal circuit component data
    // ═══════════════════════════════════════════════════════════

    const allPedals = await ctx.db.query("fxPedalList").collect();

    // Circuit type → transfer function mapping
    const circuitTransferFunctions: Record<string, number[]> = {
      "compression": [0.0, 0.3, 0.5, 0.65, 0.75, 0.82, 0.88, 0.92, 0.95, 0.97, 1.0],
      "overdrive": [0.0, 0.2, 0.4, 0.58, 0.72, 0.83, 0.91, 0.96, 0.98, 0.99, 1.0],
      "distortion": [0.0, 0.3, 0.55, 0.75, 0.88, 0.95, 0.98, 0.99, 1.0, 1.0, 1.0],
      "delay": [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      "modulation": [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      "eq": [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      "gate": [0.0, 0.0, 0.0, 0.1, 0.5, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0],
      "multi": [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    };

    for (const pedal of allPedals) {
      const category = pedal.category as string;
      const transferFunction = circuitTransferFunctions[category] ??
        circuitTransferFunctions["overdrive"];

      await ctx.db.insert("fxPedalCircuitValues", {
        pedalId: pedal._id,
        circuitType: category,
        componentValues: {
          inputImpedance: category === "overdrive" ? 500000 : 1000000,
          outputImpedance: 10000,
          clippingThreshold: category === "distortion" ? 0.3 : 0.6,
          filterCutoff: category === "eq" ? 1000 : 4000,
        },
        transferFunction,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // cabToneValues — cabinet body resonance
    // ═══════════════════════════════════════════════════════════

    const allCabs = await ctx.db.query("cabList").collect();

    const cabDimensions: Record<string, { depth: number; dimension: number }> = {
      "4x12": { depth: 0.35, dimension: 0.76 },
      "2x12": { depth: 0.28, dimension: 0.62 },
      "1x12": { depth: 0.25, dimension: 0.50 },
      "4x10": { depth: 0.30, dimension: 0.62 },
    };

    for (const cab of allCabs) {
      const dims = cabDimensions[cab.speakerConfig] ?? cabDimensions["4x12"];
      // Air simulation: frequency response of the cabinet body resonance
      const airSim = [
        60, 0.8, 120, 1.0, 250, 1.05, 500, 1.0,
        1000, 0.95, 2000, 0.9, 4000, 0.85, 8000, 0.75,
      ];
      await ctx.db.insert("cabToneValues", {
        cabId: cab._id,
        depth: dims.depth,
        dimension: dims.dimension,
        airSimulation: airSim,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // speakerToneValues — speaker impedance curves
    // ═══════════════════════════════════════════════════════════

    const allSpeakers = await ctx.db.query("speakerList").collect();

    for (const speaker of allSpeakers) {
      // Impedance curve: frequency/impedance pairs modeling the speaker's
      // complex impedance (resonant peak + rising high-frequency impedance)
      const impedanceCurve = [
        20, 8.0, 50, 12.0, 80, 25.0, 100, 18.0, 200, 8.5,
        400, 8.2, 800, 8.5, 1600, 9.0, 3200, 10.5, 6400, 14.0,
        10000, 20.0, 16000, 30.0,
      ];

      await ctx.db.insert("speakerToneValues", {
        speakerId: speaker._id,
        frequencySpectrum: speaker.frequencyResponse,
        impedanceCurve,
      });
    }

    return {
      status: "seeded",
      counts: {
        ampToneStacks: allAmps.length,
        preampStages: allAmps.reduce((sum, a) => sum + (a.preampStageCount ?? 3), 0),
        pedalCircuits: allPedals.length,
        cabTones: allCabs.length,
        speakerTones: allSpeakers.length,
      },
    };
  },
});
