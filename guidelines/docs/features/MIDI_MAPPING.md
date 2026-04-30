# MIDI Integration & Mapping

Our application supports both physical (USB) and Bluetooth MIDI devices for real-time control of the simulation.

## 🔡 Supported Commands
- **Control Change (CC)**: Mapping knobs and sliders (e.g., CC 7 for Volume, CC 11 for Expression).
- **Program Change (PC)**: Switching between saved signal chains and presets.
- **Note On/Off**: Triggering specific effects or toggles (e.g., "Boost" or "Channel Switch").

## 🗺️ Mapping Interface
- **Learn Mode**: Users can click a "Learn" button on any UI knob and move their physical MIDI controller to bind them instantly.
- **Default Profiles**: Pre-configured mappings for popular floor controllers (Line 6 FBV, Behringer FCB1010, etc.).
- **Sub-10ms MIDI Processing**: Ensuring that when you step on a pedal, the simulation reacts at the same speed as the hardware.

## 🦷 Bluetooth MIDI
- Low-energy (LE) MIDI support for wireless foot controllers, optimized for mobile (Android) and desktop (Electron) versions.
