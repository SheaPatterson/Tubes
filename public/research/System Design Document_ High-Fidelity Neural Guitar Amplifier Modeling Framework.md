### System Design Document: High-Fidelity Neural Guitar Amplifier Modeling Framework

#### 1\. Executive Strategy: The Paradigm Shift in Virtual Analog Synthesis

The evolution of digital audio processing has reached a pivotal juncture where traditional heuristic modeling is being superseded by data-driven neural architectures. For decades, the pursuit of authentic vacuum tube emulation was confined to "white-box" techniques—mathematical representations of physical components derived from circuit schematics and differential equations. However, the inherent complexity of non-linear interactions, such as the parasitic capacitance of transformers and the volatile thermal behavior of power tubes, creates a "ghost in the machine" that defies static heuristic approximation. Capturing these subtle, dynamic nonlinearities requires a strategic transition toward machine learning. This shift enables the creation of digital twins that identify and replicate the transfer function of high-end hardware with a precision that frequently renders the digital copy indistinguishable from the analog original in blind listening tests.The landscape of modern modeling is defined by the choice between Black-Box and Grey-Box architectures. While both leverage deep learning, they differ in their reliance on theoretical circuit structures and computational budgets.

##### Comparison of Modeling Approaches

Feature,Black-Box Modeling,Grey-Box Modeling  
Methodology,Purely data-driven; ignores internal circuit structure.,Combines partial theoretical structures with neural components.  
Interpretability,"Low; the model is a ""snapshot"" of the behavior.","Higher; uses differentiable DSP blocks (filters, EQs)."  
Computational Efficiency,Higher overhead for complex saturations.,Very high; can reduce operations by up to 90%.  
Accuracy,"State-of-the-art for static ""snapshots"" (e.g., NAM).",Comparable to black-box while maintaining flexibility.  
Best Use Case,High-end workstation captures.,Mobile/embedded deployment and parametric control.  
This strategic transition relies on a deep understanding of the hardware target, as specific circuit non-linearities dictate the requirements for the synthetic data generation pipeline and the stateful nature of the final neural architecture.

#### 2\. Hardware Target Analysis: Circuit Topologies and Harmonic Genesis

A successful neural model must be grounded in the "ground truth" of stage-by-stage circuit analysis. Understanding the specific mechanisms of harmonic generation—from cathode degeneration to diode-clipping thresholds—is essential for designing a training pipeline that captures the aesthetic distortion of vacuum tubes pushed beyond their linear limits.

##### Primary Hardware Components and Audible Characteristics

Circuit Component,Primary Function in Sound Shaping,Audible Characteristic  
Preamplifier Triode,Initial voltage amplification and saturation.,Harmonic richness and gain texture.  
Cathode Follower,Impedance matching and DC coupling.,"Smooth, asymmetric clipping behavior."  
Tone Stack (Passive),Frequency-dependent attenuation (insertion loss).,"Mid-scoop or treble-boost ""voicing."""  
Phase Inverter (LTP),Driving push-pull power amps via 8-ohm tap feedback.,"Dynamic ""bloom"" and transitional grit."  
Output Transformer,Impedance matching to speaker load.,"Frequency-dependent saturation and power ""sag."""

##### Specific Training Targets and Non-linearities

Modeling specific devices requires targeting their unique physical behaviors:

* **Marshall Guv’nor:**  This circuit utilizes Red LEDs for hard-clipping with a forward voltage of 1.8V to 2V. The model must account for the massive 70dB of internal gain (33.3dB input stage \+ 36dB clipping stage) required to overcome the subsequent 10-20dB loss in the passive tone stack.  
* **Peavey VTM:**  The neural model must capture the impact of dip-switch-based circuit modifications. Specifically, the model must differentiate between the "icy cold" bias of a 6.8kΩ cathode resistor and the "Plexi-style" 2.7kΩ bias, as well as the 0.68µF bypass capacitor transition frequency at 234Hz which prevents low-end muddiness.  
* **Voltage Sag:**  The power supply "sag" occurs during high-volume transients as the power amp draws significant current. This introduces a natural compression effect that is best modeled using the "memory" of stateful LSTM hidden units.

##### Analog Delay Structures: MN3007 Bucket Brigade Device (BBD)

Modeling the MN3007 BBD introduces sampling-related non-linearities. The model must account for the Nyquist-Shannon limitations and the necessity of 3rd or 4th order Sallen-Key low-pass filters (30-36 dB/octave) to suppress clock noise spikes at approximately 3kHz. To achieve professional fidelity, we target the  **Complementary Output Topology** , which utilizes two source follower transistors connected to the last two capacitors to generate a full-wave output, effectively minimizing clock frequency components.

#### 3\. Automated Data Generation: SPICE Integration and LLM Assistance

To overcome the "bottleneck" of physical data acquisition—noise, hum, and the need for expensive load boxes—we utilize SPICE (Simulation Program with Integrated Circuit Emphasis) to generate noise-free, high-fidelity datasets.

##### The Circuit-to-Dataset Pipeline

Using Python-based frameworks like spicelib, we automate the generation of thousands of "wet" audio samples. The SimRunner class facilitates parallel execution across CPU cores, allowing batch simulations that vary potentiometer settings and input voltages. This is critical for  **Parametric Modeling** , where the neural model must accurately reflect the movement of physical knobs.

##### SPICEPilot and LLM Integration

The "SPICEPilot" architecture leverages Large Language Models to generate hardware-specific Python/PySpice scripts and transistor models, addressing data scarcity in complex circuits. Every dataset generated must adhere to the  **ToneTwist AFx benchmark** : 48 kHz sample rate, 24-bit/32-bit float depth, and \~10,000 3-second audio blocks accompanied by a  **JSON metadata schema**  defining exact knob positions.

##### Modeling Complexity Categorization

Complexity is defined by the transistor count of the target circuit:

* **Easy:**   $\\leq 10$  transistors (e.g., simple booster/overdrive pedals).  
* **Medium:**   $11 \- 25$  transistors (e.g., discrete preamplifier stages).  
* **Hard:**   $26 \- 45$  transistors (e.g., multi-stage tube amplifier simulations).  
* **Extreme:**   $\> 45$  transistors (e.g., full digital-analog hybrid systems).

#### 4\. Neural Architecture Design: LSTM, WaveNet, and DDSP

The selection of neural architectures involves a strategic trade-off between tonal authenticity and real-time performance on consumer hardware.

##### Comparison of Neural Architectures

Feature,LSTM (Recurrent),WaveNet (Convolutional)  
Real-Time Latency,Low (Stateful processing).,Dependent on dilation layers.  
Training Speed,Fast (Minutes on CPU/GPU).,Slow (Often requires GPU hours).  
Hardware Affinity,Mobile and Embedded CPUs.,GPU/NPU Acceleration.  
Complexity,Memory-state dependent.,Receptive field dependent.

##### Mathematical Structure of the LSTM Unit

The LSTM is the standard for modeling reactive components (capacitors/inductors) due to its internal state memory. The flow of signal information is regulated by the following equations:  $$i\_t \= \\sigma(W\_{xi}x\_t \+ W\_{hi}h\_{t-1} \+ b\_i)$$   $$f\_t \= \\sigma(W\_{xf}x\_t \+ W\_{hf}h\_{t-1} \+ b\_f)$$   $$o\_t \= \\sigma(W\_{xo}x\_t \+ W\_{ho}h\_{t-1} \+ b\_o)$$   $$g\_t \= \\tanh(W\_{xg}x\_t \+ W\_{hg}h\_{t-1} \+ b\_g)$$   $$c\_t \= f\_t \\odot c\_{t-1} \+ i\_t \\odot g\_t$$   $$h\_t \= o\_t \\odot \\tanh(c\_t)$$

##### The Grey-Box Strategy: Differentiable DSP (DDSP)

To maximize efficiency, we utilize a hybrid DDSP approach. Rather than modeling the entire signal chain with a heavy neural network, we model the  **preamplifier stage**  as a non-parametric nonlinearity and the  **tone stack**  as a differentiable parametric EQ/filter. This reduces computational operations by 90% while maintaining the accuracy of the frequency-dependent "voicing."

#### 5\. Real-Time Implementation: JUCE Framework and Inference Engines

The  **JUCE framework**  provides the industry-standard environment for deployment across VST3, AU, and AAX formats.

##### Plugin Architecture and Inference

Neural processing occurs within the processBlock() function of the PluginProcessor. To ensure real-time safety, the  **Real-Time Factor (**  **$v\_{RT}**$  **)**  must be strictly maintained at  **$v\_{RT} \< 1.0**$ . This indicates the model processes audio faster than the hardware buffer demands.

##### Inference Engine Evaluation

Inference Engine,Backend Support,Performance Strength,Best Use Case  
RTNeural,"Eigen, xsimd, STL",Ultra-low latency;  SIMD (AVX/SSE) .,"Embedded audio, desktop plugins."  
ONNX Runtime,"CPU, GPU, NPU",High interoperability/model coverage.,Cross-platform desktop apps.  
TFLite,"NNAPI, CoreML, GPU",Mobile-specific acceleration.,iOS/Android modeling apps.  
RTNeural is preferred for desktop plugins because its use of SIMD intrinsics allows it to process high-dimensional LSTM states without the performance "spikes" common in general-purpose libraries.

#### 6\. Embedded Deployment and Optimization: Elk Audio OS

For self-contained hardware modelers, we utilize the  **Raspberry Pi 4**  running  **Elk Audio OS** . This environment requires low-level optimization to ensure sample-accurate stability.

##### Optimization and Workflow

The ARM  **big.LITTLE**  architecture requires managing  **CPU affinity** , ensuring the audio thread is pinned to the high-performance cores to prevent audio "gaps." The workflow involves cross-compiling the JUCE plugin and linking it with precompiled TFLite or ONNX library binaries specifically optimized for ARM targets.

#### 7\. Validation and Quality Control: The "Null Test" and ESR

To ensure professional-grade tonal fidelity, the digital twin must undergo rigorous objective evaluation against the analog hardware.

##### Evaluation Metrics

* **Error-To-Signal Ratio (ESR):**  Quantifies the deviation of the model's output from the original hardware signal.  
* **The Null Test:**  The ultimate benchmark where the model output and the analog original are summed with one signal’s phase inverted. Near-perfect silence indicates a high-fidelity capture.

##### Data Standards and Pre-processing

To ensure temporal alignment during the Null Test, all data must adhere to the following pre-processing protocol:

* **Synchronization Markers:**  Sample-accurate impulses added to the start/end of every training file.  
* **Normalization:**  All signals peak-normalized to  **\-6 dBFS**  to maximize dynamic range and maintain a consistent noise floor.  
* **Resolution:**  48 kHz / 24-bit or 32-bit floating point, matching the ToneTwist AFx standard.This comprehensive framework democratizes professional-grade tone, preserving the heritage of analog electronics within a scalable, modern digital industry.

