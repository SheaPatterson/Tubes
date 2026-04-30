# Cabinet & Microphone Physics: The 3D Space

The final sound is determined by the "Air" moved by the speaker and captured by the microphone.

## 📏 Positioning (The Z-Axis)
- **Distance (Z)**: As the mic moves away from the grill, room acoustics play a larger role. We use a hybrid IR + Convolution approach to simulate room reflections.
- **Center vs. Edge (X/Y)**: 
    - **Center**: Bright, aggressive (SM57 sweet spot).
    - **Edge**: Warmer, more mid-range focused.
- **Off-Axis Rotation**: Simulating the proximity effect and frequency roll-off when the mic is angled.

## 🎙️ Microphone Library
- **SM-57**: The standard for high-gain. Captured with high fidelity.
- **R121 (Ribbon)**: Smooth, natural, and warm.
- **C414 (Condenser)**: Crisp highs and detailed lows.

## 🔊 Speaker Dynamics
- **Voice Coil Heat**: Simulating the "compression" that happens when a speaker is pushed hard for a long period.
- **Cone Breakup**: Modeling the specific frequencies where a speaker begins to distort mechanically.
