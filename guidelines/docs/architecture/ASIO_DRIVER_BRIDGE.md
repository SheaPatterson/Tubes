# ASIO & CoreAudio: Native Driver Bridge

For our Electron-based desktop application, bypassing the standard Windows/Mac audio layers is mandatory.

## 🌉 The Bridge Logic
- **Windows (ASIO)**: Our Electron main process includes a C++ addon that interfaces directly with ASIO 2.1 drivers.
- **Mac (CoreAudio)**: Utilizing HAL (Hardware Abstraction Layer) to achieve direct access to the audio device's input/output buffers.

## 🎤 Exclusive Mode
- When running in "Live" mode, the app requests exclusive hardware access to prevent system sounds (notifications, etc.) from interrupting the audio stream and to shave off 2-5ms of system-induced latency.

## 📈 Monitoring
- Real-time buffer overflow detection and "Panic" button implementation for instant audio reset.
