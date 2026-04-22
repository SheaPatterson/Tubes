/**
 * Base AudioWorklet processor utilities.
 *
 * These helpers are designed to be self-contained so they can be inlined
 * into AudioWorklet processor files that are loaded via `addModule()`.
 * They are also exported for unit-testing on the main thread.
 */

// ─── DSP Math Helpers ────────────────────────────────────────────────

/** Linear interpolation between two values. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert decibels to a linear gain multiplier. */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/** Convert a linear gain multiplier to decibels. */
export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

/** Clamp a value to the range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// ─── Parameter Smoother ──────────────────────────────────────────────

/**
 * One-pole exponential smoother for avoiding zipper noise when
 * parameters change.  Call `setTarget()` with the new value and
 * `next()` once per sample to get the smoothed output.
 */
export class ParameterSmoother {
  private current: number;
  private target: number;
  private coefficient: number;

  /**
   * @param initialValue  Starting value.
   * @param smoothingTimeMs  Time (ms) to reach ~63 % of the target.
   * @param sampleRate  Audio sample rate in Hz.
   */
  constructor(initialValue: number, smoothingTimeMs: number, sampleRate: number) {
    this.current = initialValue;
    this.target = initialValue;
    this.coefficient = this.calcCoefficient(smoothingTimeMs, sampleRate);
  }

  private calcCoefficient(timeMs: number, sampleRate: number): number {
    if (timeMs <= 0) return 1;
    return 1 - Math.exp(-1 / ((timeMs / 1000) * sampleRate));
  }

  /** Update the smoothing time (e.g. after a sample-rate change). */
  setSmoothingTime(timeMs: number, sampleRate: number): void {
    this.coefficient = this.calcCoefficient(timeMs, sampleRate);
  }

  /** Set a new target value to smooth towards. */
  setTarget(value: number): void {
    this.target = value;
  }

  /** Advance one sample and return the smoothed value. */
  next(): number {
    this.current += this.coefficient * (this.target - this.current);
    return this.current;
  }

  /** Snap immediately to the target (no smoothing). */
  snap(): void {
    this.current = this.target;
  }

  /** Get the current smoothed value without advancing. */
  getValue(): number {
    return this.current;
  }

  /** Get the current target value. */
  getTarget(): number {
    return this.target;
  }
}

// ─── Message Port Helper ─────────────────────────────────────────────

export interface ProcessorMessage {
  type: string;
  [key: string]: unknown;
}

/**
 * Type-safe wrapper around `MessagePort` for AudioWorklet communication.
 * Subclasses override `onMessage` to handle incoming messages.
 */
export class MessagePortHandler {
  private port: MessagePort | null = null;

  /** Attach to a MessagePort (called once in the processor constructor). */
  attach(port: MessagePort): void {
    this.port = port;
    this.port.onmessage = (event: MessageEvent<ProcessorMessage>) => {
      this.onMessage(event.data);
    };
  }

  /** Send a message back to the main thread. */
  send(message: ProcessorMessage): void {
    this.port?.postMessage(message);
  }

  /** Override in subclasses to handle incoming messages. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMessage(_message: ProcessorMessage): void {
    // no-op by default
  }
}
