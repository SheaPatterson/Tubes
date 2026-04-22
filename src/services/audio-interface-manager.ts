/**
 * Audio Interface Manager Service
 *
 * Detects connected audio interfaces via navigator.mediaDevices,
 * provides optimized device profiles for popular brands, allows
 * manual input/output channel selection, handles disconnection
 * with pause/prompt/resume within 2s, and implements delay sync
 * for remote collaboration.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

// ── Types ──

export interface AudioInterfaceDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  groupId: string;
}

export interface DeviceProfile {
  brand: string;
  modelPattern: string;
  recommendedBufferSize: number;
  recommendedSampleRate: number;
}

export interface ChannelSelection {
  inputDeviceId: string | null;
  outputDeviceId: string | null;
}

export interface DelaySyncResult {
  pingMs: number;
  compensationMs: number;
  timestamp: number;
}

export type AudioInterfaceStatus =
  | 'idle'
  | 'active'
  | 'paused'
  | 'disconnected';

export interface AudioInterfaceNotification {
  type:
    | 'device_connected'
    | 'device_disconnected'
    | 'reconnection_prompt'
    | 'resumed'
    | 'delay_sync_complete'
    | 'error';
  message: string;
  deviceId?: string;
  delaySyncResult?: DelaySyncResult;
}

export type NotificationCallback = (notification: AudioInterfaceNotification) => void;
export type DeviceChangeCallback = (devices: AudioInterfaceDevice[]) => void;

export interface AudioInterfaceManager {
  initialize(): Promise<void>;
  dispose(): void;
  getDevices(): AudioInterfaceDevice[];
  getInputDevices(): AudioInterfaceDevice[];
  getOutputDevices(): AudioInterfaceDevice[];
  selectInput(deviceId: string): void;
  selectOutput(deviceId: string): void;
  getChannelSelection(): ChannelSelection;
  getDeviceProfile(deviceLabel: string): DeviceProfile | null;
  getStatus(): AudioInterfaceStatus;
  measureDelaySync(remoteTimestamp: number): DelaySyncResult;
  onNotification(callback: NotificationCallback): () => void;
  onDeviceChange(callback: DeviceChangeCallback): () => void;
}

// ── Constants ──

/**
 * Optimized device profiles for popular audio interface brands.
 * Each entry matches a brand by label substring and provides
 * recommended buffer size and sample rate for <15ms latency.
 *
 * Requirement 10.2
 */
export const DEVICE_PROFILES: DeviceProfile[] = [
  { brand: 'Focusrite', modelPattern: 'focusrite', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'Universal Audio', modelPattern: 'universal audio', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'PreSonus', modelPattern: 'presonus', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'MOTU', modelPattern: 'motu', recommendedBufferSize: 64, recommendedSampleRate: 48000 },
  { brand: 'RME', modelPattern: 'rme', recommendedBufferSize: 64, recommendedSampleRate: 48000 },
  { brand: 'Audient', modelPattern: 'audient', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'Steinberg', modelPattern: 'steinberg', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'Behringer', modelPattern: 'behringer', recommendedBufferSize: 256, recommendedSampleRate: 44100 },
  { brand: 'Native Instruments', modelPattern: 'native instruments', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'Arturia', modelPattern: 'arturia', recommendedBufferSize: 128, recommendedSampleRate: 48000 },
  { brand: 'SSL', modelPattern: 'ssl', recommendedBufferSize: 64, recommendedSampleRate: 48000 },
  { brand: 'Apogee', modelPattern: 'apogee', recommendedBufferSize: 64, recommendedSampleRate: 96000 },
];

const DEFAULT_BUFFER_SIZE = 256;
const DEFAULT_SAMPLE_RATE = 44100;
const RECONNECTION_TIMEOUT_MS = 2000;
const DELAY_SYNC_PING_COUNT = 5;

// ── Helpers ──

/**
 * Match a device label against known device profiles (case-insensitive).
 */
export function matchDeviceProfile(label: string): DeviceProfile | null {
  const lower = label.toLowerCase();
  for (const profile of DEVICE_PROFILES) {
    if (lower.includes(profile.modelPattern)) {
      return profile;
    }
  }
  return null;
}

/**
 * Convert a MediaDeviceInfo to our AudioInterfaceDevice type.
 */
function toAudioInterfaceDevice(info: MediaDeviceInfo): AudioInterfaceDevice | null {
  if (info.kind !== 'audioinput' && info.kind !== 'audiooutput') {
    return null;
  }
  return {
    deviceId: info.deviceId,
    label: info.label || `Unknown ${info.kind === 'audioinput' ? 'Input' : 'Output'}`,
    kind: info.kind,
    groupId: info.groupId,
  };
}

/**
 * Compute delay compensation for remote collaboration.
 * Uses the difference between local and remote timestamps
 * to estimate one-way latency and produce a compensation value.
 *
 * Requirement 10.5
 */
export function computeDelayCompensation(
  localTimestamp: number,
  remoteTimestamp: number,
): DelaySyncResult {
  const pingMs = Math.abs(localTimestamp - remoteTimestamp);
  // Compensation is half the round-trip estimate (one-way delay)
  const compensationMs = Math.round(pingMs / 2);
  return {
    pingMs,
    compensationMs,
    timestamp: localTimestamp,
  };
}

// ── Implementation ──

export function createAudioInterfaceManager(): AudioInterfaceManager {
  let devices: AudioInterfaceDevice[] = [];
  let status: AudioInterfaceStatus = 'idle';
  let disposed = false;

  let selectedInputId: string | null = null;
  let selectedOutputId: string | null = null;

  let reconnectionTimer: ReturnType<typeof setTimeout> | null = null;
  let deviceChangeHandler: (() => void) | null = null;

  const notificationListeners = new Set<NotificationCallback>();
  const deviceChangeListeners = new Set<DeviceChangeCallback>();

  // ── Internal helpers ──

  function emit(notification: AudioInterfaceNotification): void {
    for (const cb of notificationListeners) {
      try { cb(notification); } catch { /* listener errors must not break the manager */ }
    }
  }

  function emitDeviceChange(): void {
    for (const cb of deviceChangeListeners) {
      try { cb([...devices]); } catch { /* listener errors must not break the manager */ }
    }
  }

  async function enumerateDevices(): Promise<AudioInterfaceDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices: AudioInterfaceDevice[] = [];

    for (const info of mediaDevices) {
      const device = toAudioInterfaceDevice(info);
      if (device) {
        audioDevices.push(device);
      }
    }

    return audioDevices;
  }

  /**
   * Check if the currently selected input device is still connected.
   * If not, trigger disconnection handling.
   *
   * Requirement 10.6
   */
  function checkSelectedDevicePresence(newDevices: AudioInterfaceDevice[]): void {
    if (status !== 'active' || !selectedInputId) return;

    const stillPresent = newDevices.some(
      (d) => d.deviceId === selectedInputId && d.kind === 'audioinput',
    );

    if (!stillPresent) {
      handleDisconnection(selectedInputId);
    }
  }

  /**
   * Handle audio interface disconnection:
   * 1. Pause processing
   * 2. Show reconnection prompt
   * 3. Wait for reconnection within 2s
   *
   * Requirement 10.6
   */
  function handleDisconnection(deviceId: string): void {
    if (status === 'disconnected' || status === 'paused') return;

    status = 'paused';

    emit({
      type: 'device_disconnected',
      message: 'Audio interface disconnected. Processing paused.',
      deviceId,
    });

    emit({
      type: 'reconnection_prompt',
      message: 'Audio interface disconnected. Reconnect to continue.',
      deviceId,
    });

    // Start reconnection timer — resume within 2s if device reappears
    startReconnectionWatch(deviceId);
  }

  function startReconnectionWatch(deviceId: string): void {
    clearReconnectionTimer();

    status = 'disconnected';

    // Poll for device reconnection at short intervals within the 2s window
    const startTime = Date.now();
    const pollInterval = 200;

    const poll = async () => {
      if (disposed) return;

      const elapsed = Date.now() - startTime;
      if (elapsed >= RECONNECTION_TIMEOUT_MS) {
        // Timeout reached — device did not reconnect within 2s
        return;
      }

      const currentDevices = await enumerateDevices();
      const reconnected = currentDevices.some(
        (d) => d.deviceId === deviceId && d.kind === 'audioinput',
      );

      if (reconnected) {
        devices = currentDevices;
        status = 'active';
        emitDeviceChange();

        emit({
          type: 'resumed',
          message: 'Audio interface reconnected. Processing resumed.',
          deviceId,
        });
        return;
      }

      // Continue polling
      reconnectionTimer = setTimeout(poll, pollInterval);
    };

    reconnectionTimer = setTimeout(poll, pollInterval);
  }

  function clearReconnectionTimer(): void {
    if (reconnectionTimer !== null) {
      clearTimeout(reconnectionTimer);
      reconnectionTimer = null;
    }
  }

  async function handleDeviceChange(): Promise<void> {
    if (disposed) return;

    const newDevices = await enumerateDevices();
    const previousDeviceIds = new Set(devices.map((d) => d.deviceId));
    const newDeviceIds = new Set(newDevices.map((d) => d.deviceId));

    // Detect newly connected devices
    for (const device of newDevices) {
      if (!previousDeviceIds.has(device.deviceId)) {
        emit({
          type: 'device_connected',
          message: `Audio device connected: ${device.label}`,
          deviceId: device.deviceId,
        });
      }
    }

    // Check if selected device was disconnected
    checkSelectedDevicePresence(newDevices);

    // Check if a previously disconnected device has reconnected via devicechange event
    if (
      (status === 'disconnected' || status === 'paused') &&
      selectedInputId &&
      newDeviceIds.has(selectedInputId)
    ) {
      clearReconnectionTimer();
      status = 'active';

      emit({
        type: 'resumed',
        message: 'Audio interface reconnected. Processing resumed.',
        deviceId: selectedInputId,
      });
    }

    devices = newDevices;
    emitDeviceChange();
  }

  // ── Public API ──

  const manager: AudioInterfaceManager = {
    async initialize(): Promise<void> {
      if (disposed) {
        throw new Error('Audio Interface Manager has been disposed');
      }

      // Enumerate devices on launch (Requirement 10.1)
      devices = await enumerateDevices();

      // Listen for device changes
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        deviceChangeHandler = () => { handleDeviceChange(); };
        navigator.mediaDevices.addEventListener('devicechange', deviceChangeHandler);
      }

      status = 'idle';
    },

    dispose(): void {
      disposed = true;
      clearReconnectionTimer();

      if (deviceChangeHandler && typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', deviceChangeHandler);
        deviceChangeHandler = null;
      }

      notificationListeners.clear();
      deviceChangeListeners.clear();
      devices = [];
      selectedInputId = null;
      selectedOutputId = null;
      status = 'idle';
    },

    getDevices(): AudioInterfaceDevice[] {
      return [...devices];
    },

    getInputDevices(): AudioInterfaceDevice[] {
      return devices.filter((d) => d.kind === 'audioinput');
    },

    getOutputDevices(): AudioInterfaceDevice[] {
      return devices.filter((d) => d.kind === 'audiooutput');
    },

    selectInput(deviceId: string): void {
      const device = devices.find((d) => d.deviceId === deviceId && d.kind === 'audioinput');
      if (!device) {
        emit({
          type: 'error',
          message: `Input device not found: ${deviceId}`,
          deviceId,
        });
        return;
      }
      selectedInputId = deviceId;
      status = 'active';
    },

    selectOutput(deviceId: string): void {
      const device = devices.find((d) => d.deviceId === deviceId && d.kind === 'audiooutput');
      if (!device) {
        emit({
          type: 'error',
          message: `Output device not found: ${deviceId}`,
          deviceId,
        });
        return;
      }
      selectedOutputId = deviceId;
    },

    getChannelSelection(): ChannelSelection {
      return {
        inputDeviceId: selectedInputId,
        outputDeviceId: selectedOutputId,
      };
    },

    getDeviceProfile(deviceLabel: string): DeviceProfile | null {
      return matchDeviceProfile(deviceLabel);
    },

    getStatus(): AudioInterfaceStatus {
      return status;
    },

    /**
     * Measure delay for remote collaboration sync.
     * Computes compensation based on the difference between
     * local time and a remote timestamp.
     *
     * Requirement 10.5
     */
    measureDelaySync(remoteTimestamp: number): DelaySyncResult {
      const localTimestamp = Date.now();
      const result = computeDelayCompensation(localTimestamp, remoteTimestamp);

      emit({
        type: 'delay_sync_complete',
        message: `Delay sync complete. Ping: ${result.pingMs}ms, Compensation: ${result.compensationMs}ms`,
        delaySyncResult: result,
      });

      return result;
    },

    onNotification(callback: NotificationCallback): () => void {
      notificationListeners.add(callback);
      return () => { notificationListeners.delete(callback); };
    },

    onDeviceChange(callback: DeviceChangeCallback): () => void {
      deviceChangeListeners.add(callback);
      return () => { deviceChangeListeners.delete(callback); };
    },
  };

  return manager;
}

// ── Exported helpers for testing ──

export { toAudioInterfaceDevice };
