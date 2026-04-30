# Advanced Noise Gating Algorithms

In high-gain environments (like US Steel or Winston Lead channels), noise management is critical. We implement a non-linear, adaptive gate.

## 🤫 SmartGate™ Technology
- **Frequency-Dependent Gating**: Instead of a simple volume threshold, our gate analyzes the frequency spectrum to identify and suppress "hum" and "hiss" while preserving the sustain of the notes.
- **Adaptive Release**: The gate's release time is adjusted dynamically based on the input signal's decay rate.
- **Sidechain Input**: Users can assign an "unprocessed" input signal as the sidechain source to ensure the gate opens precisely even for heavy palm-muting.

## 🎚️ User Controls
- **Threshold**: Sensitivity setting.
- **Reduction**: How many dB to drop when gated.
- **Hysteresis**: Prevents the gate from "chattering" at the threshold level.
- **Hard/Soft Toggle**: Switching between the "Distortion +" style hard-gate and a smooth studio gate.
