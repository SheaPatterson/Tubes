# WebAssembly (WASM) Audio Core

For sub-15ms latency, the core audio DSP (Digital Signal Processing) is written in C++ and compiled to WASM.

## 🚀 Performance Advantages
- **Near-Native Speed**: Running circuit modeling algorithms at 90% of native C++ speed.
- **Thread Safety**: Using `AudioWorkletProcessor` to run the DSP in a separate high-priority thread, preventing UI jank from affecting sound output.
- **SIMD Optimization**: Leveraging Single Instruction Multiple Data instructions for parallel processing of stereo channels and FFT calculations.

## 🧵 Implementation Details
- **Wasm-pack**: Toolchain for bridging the WASM binary with our React frontend.
- **SharedArrayBuffer**: For zero-copy data transfer between the main thread (UI knobs) and the audio thread (DSP).
