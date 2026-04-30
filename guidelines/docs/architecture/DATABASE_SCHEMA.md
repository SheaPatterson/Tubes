# Database Schema: The Brain of the Simulation

To achieve professional-grade realism, our database must store more than just presets. It stores the physics of sound.

## 🗄️ Core Tables

### `amplifier_models`
- `id`: UUID
- `name`: String (e.g., "Winston CHL")
- `manufacturer_emulation`: String (e.g., "Marshall")
- `preamp_tubes_qty`: Integer (e.g., 3)
- `power_amp_tubes_type`: Enum (EL34, 6L6, etc.)
- `default_bias`: Float
- `architecture_profile`: JSON (Curve data for tone stack)

### `fx_pedals`
- `id`: UUID
- `brand_alias`: Enum (MAC, KING, Manhattan, TOKOYO)
- `category`: Enum (Drive, Modulation, Spatial, Dynamic)
- `circuit_data`: JSON (Simulated component values)
- `interface_style`: JSON (Knob positions, colors, skeuomorphic assets)

### `cabinet_sims`
- `id`: UUID
- `speaker_qty`: Integer (1, 2, 4)
- `speaker_type`: String (V30, Greenback, etc.)
- `cab_dimension_factor`: Float (Resonance calculation)
- `ir_data_path`: String

### `signal_chains`
- `id`: UUID
- `user_id`: UUID
- `name`: String
- `nodes`: JSON (Ordered list of Input -> FX -> Amp -> FX Loop -> Cab -> EQ -> Output)
- `is_public`: Boolean

### `ai_neural_profiles`
- `id`: UUID
- `target_model_id`: UUID
- `weights_path`: String (Reference to blob storage)
- `last_trained`: Timestamp
- `accuracy_coefficient`: Float

## 🔄 Real-Time Sync Table (Convex/ElectricSQL compatible)
### `active_session_state`
- `session_id`: UUID
- `current_chain_id`: UUID
- `knob_states`: JSON (Maps component_id to value 1-10)
- `latency_sync_ms`: Integer
