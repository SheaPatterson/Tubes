# Multi-Platform Deployment: Electron & Android

Our architecture is designed to scale dynamically from a high-powered desktop workstation to a portable mobile device.

## 🖥️ Electron (Windows & Mac)
- **Engine**: The web-app is wrapped in a native Electron shell.
- **ASIO/CoreAudio Bridge**: We map the web-app's audio stream directly to native drivers for lowest possible latency.
- **Localhost Processing**: Most computational functions are passed to the local CPU to reduce network dependency.
- **One-Command Build**: Scripts are prepared to package for DMG (Mac) and EXE (Windows) instantly.

## 📱 Android (Fully Functional)
- **Dynamic Scaling**: The UI uses a fluid grid system that rearranges skeuomorphic elements (Amps, Pedals) into an optimized vertical flow for mobile.
- **AAudio / OpenSL ES**: Utilizing Android's lowest latency audio APIs.
- **Native Components**: Using WebView bridges to access Android's MIDI and Audio permission sets.

## 🌩️ Subscription Sync
- **Neural Sync**: If the user has a "Next Gen" subscription, the app intelligently determines whether to process AI locally (if GPU is available via WebGPU) or offload to the VPS.
