# Offline Access: Progressive Web App (PWA)

To ensure musicians can use the "Classic" engine even in rehearsal spaces without internet, we implement advanced PWA technology.

## 📡 Service Workers
- **Asset Caching**: All Amp and Pedal visual assets, WASM binaries, and IR data are cached locally.
- **Offline Logic**: The simulation engine runs entirely in the client's browser (or PWA shell).

## 🔄 Conflict-free Replicated Data Type (CRDT)
- **Data Sync**: When the user goes offline, they can still save presets and modify signal chains.
- **Merge Logic**: Upon reconnecting to the internet, our CRDT logic merges the changes with the cloud database (Neon/Convex) without data loss or conflicts.

## 📦 PWA Manifest
- **Standalone Mode**: The app appears as a native application on Android and iOS.
- **Home Screen Integration**: Full-screen experience without browser chrome.
