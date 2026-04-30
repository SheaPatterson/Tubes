# Preamp Stage Simulation: The 12AX7 Engine

Our preamp simulation is not a simple filter. It is a stage-by-stage voltage approximation model.

## 🔬 Modeling Logic
- **Gain Cascading**: Each 12AX7 tube provides two triode stages. A typical high-gain amp (like Winston) uses 3-4 cascaded stages.
- **Harmonic Distortion**: We calculate the non-linear clipping of each stage based on the input voltage from the previous stage.
- **Grid Current & Miller Effect**: Including subtle capacitance shifts as gain increases, darkening the tone at extreme settings.

## 🎚️ Settings Variables
- **Drive**: Controls the input level to the first stage.
- **Plate Voltage**: Real-time adjustable variable that changes the headroom of the simulation.
- **Cathode Bias**: Affects the "asymmetry" of the clipping, defined in our database per manufacturer profile.
