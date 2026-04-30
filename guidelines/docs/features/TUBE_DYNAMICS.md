# The Science of Sag: Power Amp Tube Dynamics

The most missed component in many digital modelers is how the power amp responds when pushed "hard".

## 🌡️ Characteristics of a Driven Tube
- **Sag**: The voltage drop that occurs when a tube is hit with a transient, resulting in a "squishy" compression that defines the feel of a tube amp.
- **Bias**: The idle current setting. We allow real-time adjustment of bias to go from "cold" (brittle, clean) to "hot" (rich harmonics, faster saturation).
- **Voltage Scaling**: Simulating a Variac (variable transformer) to drop the overall operating voltage for "Brown Sound" dynamics.

## 🧪 Simulation Variables
- **Pick Attack Detection**: Using high-speed transient analysis to determine how the "virtual power tubes" should compress.
- **Dynamic Response**: The transition from clean to sustained overdrive based solely on guitar volume and pick intensity.
- **Tube Types**:
    - **KT88**: Massive headroom, tight lows.
    - **EL34**: The British crunch, prominent mids.
    - **6L6**: American sparkle, deep lows, glassy highs.
    - **EL84**: Chimey, early breakup.
