/**
 * Type declarations for the AudioWorklet global scope.
 *
 * These types are available inside AudioWorklet processors loaded via
 * `audioWorklet.addModule()` but are not part of the standard DOM lib
 * typings.  This file makes TypeScript aware of them.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean;
}

interface AudioParamDescriptor {
  name: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  automationRate?: 'a-rate' | 'k-rate';
}

declare function registerProcessor(
  name: string,
  processorCtor: new () => AudioWorkletProcessor,
): void;
