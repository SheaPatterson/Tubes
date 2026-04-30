# User Preset Cloud Synchronization

One of our primary features for paying subscribers is the ability to move seamlessly between devices.

## 🌩️ The Sync Pipeline
1. **Change Detected**: User adjusts a knob on the "Winston" faceplate.
2. **Local Update**: UI and WASM DSP update instantly.
3. **Background Sync**: The change is sent via WebSocket/Convex to our VPS database.
4. **Broadcast**: Any other active sessions (e.g., your laptop and your phone) receive the update in real-time.

## 💾 JSON-First Snapshots
- Signal chains are stored as compact JSON objects containing model IDs, bypass states, and normalized knob values (0-1).
- This ensures that a 10-pedal signal chain only consumes ~2KB of data, allowing for millions of presets to be stored and shared efficiently.

## 🤝 Community Library
- "Public" presets can be rated and downloaded by the community, creating a decentralized database of user-curated tones.
