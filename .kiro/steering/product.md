# Product Overview

The Amp Simulation Platform is a cross-platform guitar amplifier and effects simulation application for guitarists and musicians. It competes with products like Positive Grid Bias, IK Multimedia AmpliTube, and Softube.

## Core Concept

Real-time audio signal chain processing that simulates amplifiers, effects pedals, cabinets, speakers, and microphones — all under renamed brand identities (e.g., MXR → MAC, BOSS → KING, Electro-Harmonix → Manhattan, Ibanez → TOKYO).

## Subscription Tiers

- **Free**: 1 amp model, 3 FX pedals, 1 cabinet
- **Classic**: Full access to all gear, CPU-based DSP processing
- **Next Gen**: Classic + cloud AI neural network enhancement for improved tonal realism

## Delivery Targets

- Next.js web app (Vercel)
- PWA with offline support
- Electron desktop app (Mac + Windows)
- Android app

## Key Features

- Ordered signal chain: Input → Preamp FX → Preamp Tubes → Amplifier → FX Loop → Cabinet → Output
- Skeuomorphic amp/pedal UI with glassmorphic chrome elements
- Sub-15ms audio latency via Web Audio API AudioWorklet
- MIDI controller integration
- Audio interface detection and configuration
- Saved signal chains with cross-device sync (CRDT-based via Convex)
- Live performance mode with quick-access preset slots
- Recording engine (WAV/MP3/FLAC)
