# WebGPU: The Future of Desktop Inferencing

While WebAssembly handles the audio DSP, WebGPU allows us to run heavy AI neural networks directly on the user's hardware.

## 🏎️ Parallel Acceleration
- **Inference Speed**: Using the user's GPU to compute the "Step 11" neural layer in parallel with the audio stream.
- **Latency reduction**: By running the model locally via WebGPU, we avoid the network latency of cloud-based inferencing for "Next Gen" subscribers with compatible hardware.

## 📊 Neural Visualization
- WebGPU also powers the high-speed 3D visualizations in the **Neural Status** dashboard, allowing for frames-per-second that match the audio frequency response.

## 🛠️ Fallback Strategy
- **WebGPU-to-WASM**: If no GPU is detected, the app falls back to an optimized WASM version of the neural model.
- **WASM-to-Cloud**: If local resources are insufficient for the current model precision, the task is offloaded to the VPS via WebSockets.
