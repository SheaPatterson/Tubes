import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAudioInterfaceManager,
  matchDeviceProfile,
  computeDelayCompensation,
  toAudioInterfaceDevice,
  DEVICE_PROFILES,
  type AudioInterfaceManager,
  type AudioInterfaceDevice,
  type AudioInterfaceNotification,
} from '@/services/audio-interface-manager';

// ── Mock navigator.mediaDevices ──

function createMockMediaDeviceInfo(
  overrides: Partial<MediaDeviceInfo> & { deviceId: string; kind: MediaDeviceKind },
): MediaDeviceInfo {
  return {
    deviceId: overrides.deviceId,
    groupId: overrides.groupId ?? 'group-1',
    kind: overrides.kind,
    label: overrides.label ?? '',
    toJSON: () => ({}),
  };
}

let mockDevices: MediaDeviceInfo[];
let deviceChangeListeners: Array<() => void>;

beforeEach(() => {
  mockDevices = [
    createMockMediaDeviceInfo({
      deviceId: 'input-1',
      kind: 'audioinput',
      label: 'Focusrite Scarlett 2i2',
      groupId: 'group-focusrite',
    }),
    createMockMediaDeviceInfo({
      deviceId: 'output-1',
      kind: 'audiooutput',
      label: 'Focusrite Scarlett 2i2',
      groupId: 'group-focusrite',
    }),
    createMockMediaDeviceInfo({
      deviceId: 'input-2',
      kind: 'audioinput',
      label: 'Built-in Microphone',
      groupId: 'group-builtin',
    }),
    createMockMediaDeviceInfo({
      deviceId: 'output-2',
      kind: 'audiooutput',
      label: 'Built-in Speakers',
      groupId: 'group-builtin',
    }),
  ];

  deviceChangeListeners = [];

  const mockMediaDevices = {
    enumerateDevices: vi.fn().mockResolvedValue(mockDevices),
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (event === 'devicechange') {
        deviceChangeListeners.push(handler);
      }
    }),
    removeEventListener: vi.fn((event: string, handler: () => void) => {
      if (event === 'devicechange') {
        deviceChangeListeners = deviceChangeListeners.filter((h) => h !== handler);
      }
    }),
  };

  Object.defineProperty(navigator, 'mediaDevices', {
    value: mockMediaDevices,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function initManager(): Promise<AudioInterfaceManager> {
  const manager = createAudioInterfaceManager();
  await manager.initialize();
  return manager;
}

function simulateDeviceChange(newDevices: MediaDeviceInfo[]): void {
  mockDevices.length = 0;
  mockDevices.push(...newDevices);
  (navigator.mediaDevices.enumerateDevices as ReturnType<typeof vi.fn>).mockResolvedValue(mockDevices);
  for (const listener of deviceChangeListeners) {
    listener();
  }
}

// ── matchDeviceProfile tests ──

describe('matchDeviceProfile', () => {
  it('matches Focusrite devices', () => {
    const profile = matchDeviceProfile('Focusrite Scarlett 2i2');
    expect(profile).not.toBeNull();
    expect(profile!.brand).toBe('Focusrite');
    expect(profile!.recommendedBufferSize).toBe(128);
    expect(profile!.recommendedSampleRate).toBe(48000);
  });

  it('matches case-insensitively', () => {
    const profile = matchDeviceProfile('FOCUSRITE SCARLETT 4I4');
    expect(profile).not.toBeNull();
    expect(profile!.brand).toBe('Focusrite');
  });

  it('matches RME devices with low buffer', () => {
    const profile = matchDeviceProfile('RME Fireface UCX II');
    expect(profile).not.toBeNull();
    expect(profile!.brand).toBe('RME');
    expect(profile!.recommendedBufferSize).toBe(64);
  });

  it('matches Apogee devices with high sample rate', () => {
    const profile = matchDeviceProfile('Apogee Duet 3');
    expect(profile).not.toBeNull();
    expect(profile!.recommendedSampleRate).toBe(96000);
  });

  it('returns null for unknown devices', () => {
    expect(matchDeviceProfile('Built-in Microphone')).toBeNull();
    expect(matchDeviceProfile('Unknown Device')).toBeNull();
  });
});

// ── toAudioInterfaceDevice tests ──

describe('toAudioInterfaceDevice', () => {
  it('converts audioinput MediaDeviceInfo', () => {
    const info = createMockMediaDeviceInfo({
      deviceId: 'dev-1',
      kind: 'audioinput',
      label: 'Test Input',
      groupId: 'grp-1',
    });
    const device = toAudioInterfaceDevice(info);
    expect(device).toEqual({
      deviceId: 'dev-1',
      label: 'Test Input',
      kind: 'audioinput',
      groupId: 'grp-1',
    });
  });

  it('converts audiooutput MediaDeviceInfo', () => {
    const info = createMockMediaDeviceInfo({
      deviceId: 'dev-2',
      kind: 'audiooutput',
      label: 'Test Output',
      groupId: 'grp-2',
    });
    const device = toAudioInterfaceDevice(info);
    expect(device).toEqual({
      deviceId: 'dev-2',
      label: 'Test Output',
      kind: 'audiooutput',
      groupId: 'grp-2',
    });
  });

  it('returns null for videoinput devices', () => {
    const info = createMockMediaDeviceInfo({
      deviceId: 'vid-1',
      kind: 'videoinput' as MediaDeviceKind,
      label: 'Camera',
    });
    expect(toAudioInterfaceDevice(info)).toBeNull();
  });

  it('uses fallback label when label is empty', () => {
    const input = createMockMediaDeviceInfo({ deviceId: 'x', kind: 'audioinput', label: '' });
    const output = createMockMediaDeviceInfo({ deviceId: 'y', kind: 'audiooutput', label: '' });
    expect(toAudioInterfaceDevice(input)!.label).toBe('Unknown Input');
    expect(toAudioInterfaceDevice(output)!.label).toBe('Unknown Output');
  });
});

// ── computeDelayCompensation tests ──

describe('computeDelayCompensation', () => {
  it('computes half the ping as compensation', () => {
    const result = computeDelayCompensation(1000, 980);
    expect(result.pingMs).toBe(20);
    expect(result.compensationMs).toBe(10);
    expect(result.timestamp).toBe(1000);
  });

  it('handles zero difference', () => {
    const result = computeDelayCompensation(500, 500);
    expect(result.pingMs).toBe(0);
    expect(result.compensationMs).toBe(0);
  });

  it('uses absolute value for negative differences', () => {
    const result = computeDelayCompensation(100, 150);
    expect(result.pingMs).toBe(50);
    expect(result.compensationMs).toBe(25);
  });
});

// ── AudioInterfaceManager integration tests ──

describe('AudioInterfaceManager', () => {
  describe('initialization', () => {
    it('detects connected devices on launch', async () => {
      const manager = await initManager();
      const devices = manager.getDevices();

      expect(devices).toHaveLength(4);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
      manager.dispose();
    });

    it('registers devicechange listener', async () => {
      const manager = await initManager();
      expect(navigator.mediaDevices.addEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function),
      );
      manager.dispose();
    });

    it('throws when disposed', async () => {
      const manager = createAudioInterfaceManager();
      manager.dispose();
      await expect(manager.initialize()).rejects.toThrow('disposed');
    });

    it('starts in idle status', async () => {
      const manager = await initManager();
      expect(manager.getStatus()).toBe('idle');
      manager.dispose();
    });
  });

  describe('device enumeration', () => {
    it('filters input devices', async () => {
      const manager = await initManager();
      const inputs = manager.getInputDevices();

      expect(inputs).toHaveLength(2);
      expect(inputs.every((d) => d.kind === 'audioinput')).toBe(true);
      manager.dispose();
    });

    it('filters output devices', async () => {
      const manager = await initManager();
      const outputs = manager.getOutputDevices();

      expect(outputs).toHaveLength(2);
      expect(outputs.every((d) => d.kind === 'audiooutput')).toBe(true);
      manager.dispose();
    });

    it('returns copies of device arrays', async () => {
      const manager = await initManager();
      const devices1 = manager.getDevices();
      const devices2 = manager.getDevices();
      expect(devices1).not.toBe(devices2);
      expect(devices1).toEqual(devices2);
      manager.dispose();
    });
  });

  describe('channel selection', () => {
    it('selects input device', async () => {
      const manager = await initManager();
      manager.selectInput('input-1');

      const selection = manager.getChannelSelection();
      expect(selection.inputDeviceId).toBe('input-1');
      expect(manager.getStatus()).toBe('active');
      manager.dispose();
    });

    it('selects output device', async () => {
      const manager = await initManager();
      manager.selectOutput('output-1');

      const selection = manager.getChannelSelection();
      expect(selection.outputDeviceId).toBe('output-1');
      manager.dispose();
    });

    it('emits error for unknown input device', async () => {
      const manager = await initManager();
      const notifications: AudioInterfaceNotification[] = [];
      manager.onNotification((n) => notifications.push(n));

      manager.selectInput('nonexistent');

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('error');
      expect(manager.getChannelSelection().inputDeviceId).toBeNull();
      manager.dispose();
    });

    it('emits error for unknown output device', async () => {
      const manager = await initManager();
      const notifications: AudioInterfaceNotification[] = [];
      manager.onNotification((n) => notifications.push(n));

      manager.selectOutput('nonexistent');

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('error');
      expect(manager.getChannelSelection().outputDeviceId).toBeNull();
      manager.dispose();
    });

    it('starts with null selections', async () => {
      const manager = await initManager();
      const selection = manager.getChannelSelection();
      expect(selection.inputDeviceId).toBeNull();
      expect(selection.outputDeviceId).toBeNull();
      manager.dispose();
    });
  });

  describe('device profiles', () => {
    it('returns optimized profile for known device', async () => {
      const manager = await initManager();
      const profile = manager.getDeviceProfile('Focusrite Scarlett 2i2');

      expect(profile).not.toBeNull();
      expect(profile!.brand).toBe('Focusrite');
      expect(profile!.recommendedBufferSize).toBe(128);
      manager.dispose();
    });

    it('returns null for unknown device', async () => {
      const manager = await initManager();
      const profile = manager.getDeviceProfile('Built-in Microphone');
      expect(profile).toBeNull();
      manager.dispose();
    });
  });

  describe('device change handling', () => {
    it('emits device_connected notification for new devices', async () => {
      const manager = await initManager();
      const notifications: AudioInterfaceNotification[] = [];
      manager.onNotification((n) => notifications.push(n));

      // Add a new device
      const newDevices = [
        ...mockDevices,
        createMockMediaDeviceInfo({
          deviceId: 'input-3',
          kind: 'audioinput',
          label: 'New USB Interface',
          groupId: 'group-new',
        }),
      ];
      simulateDeviceChange(newDevices);

      // Wait for async enumeration
      await vi.waitFor(() => {
        expect(notifications.some((n) => n.type === 'device_connected')).toBe(true);
      });

      manager.dispose();
    });

    it('emits device change to listeners', async () => {
      const manager = await initManager();
      const changes: AudioInterfaceDevice[][] = [];
      manager.onDeviceChange((devices) => changes.push(devices));

      simulateDeviceChange(mockDevices);

      await vi.waitFor(() => {
        expect(changes.length).toBeGreaterThan(0);
      });

      manager.dispose();
    });

    it('unsubscribe removes device change listener', async () => {
      const manager = await initManager();
      const changes: AudioInterfaceDevice[][] = [];
      const unsub = manager.onDeviceChange((devices) => changes.push(devices));

      unsub();
      simulateDeviceChange(mockDevices);

      // Give async handler time to run
      await new Promise((r) => setTimeout(r, 50));
      expect(changes).toHaveLength(0);

      manager.dispose();
    });
  });

  describe('disconnection handling', () => {
    it('pauses and emits reconnection prompt when selected input disappears', async () => {
      const manager = await initManager();
      manager.selectInput('input-1');
      expect(manager.getStatus()).toBe('active');

      const notifications: AudioInterfaceNotification[] = [];
      manager.onNotification((n) => notifications.push(n));

      // Remove the selected input device
      const devicesWithoutInput1 = mockDevices.filter((d) => d.deviceId !== 'input-1');
      simulateDeviceChange(devicesWithoutInput1);

      await vi.waitFor(() => {
        expect(notifications.some((n) => n.type === 'device_disconnected')).toBe(true);
        expect(notifications.some((n) => n.type === 'reconnection_prompt')).toBe(true);
      });

      manager.dispose();
    });

    it('resumes within 2s when device reconnects', async () => {
      const manager = await initManager();
      manager.selectInput('input-1');

      const notifications: AudioInterfaceNotification[] = [];
      manager.onNotification((n) => notifications.push(n));

      // Disconnect — remove the selected input device
      const devicesWithoutInput1 = mockDevices.filter((d) => d.deviceId !== 'input-1');
      simulateDeviceChange(devicesWithoutInput1);

      await vi.waitFor(() => {
        expect(notifications.some((n) => n.type === 'reconnection_prompt')).toBe(true);
      });

      // Allow the first handleDeviceChange to fully complete
      await new Promise((r) => setTimeout(r, 50));

      // Reconnect the device — simulate devicechange with the device back
      const allDevicesBack = [
        ...devicesWithoutInput1,
        createMockMediaDeviceInfo({
          deviceId: 'input-1',
          kind: 'audioinput',
          label: 'Focusrite Scarlett 2i2',
          groupId: 'group-focusrite',
        }),
      ];
      simulateDeviceChange(allDevicesBack);

      await vi.waitFor(() => {
        expect(notifications.some((n) => n.type === 'resumed')).toBe(true);
      });

      expect(manager.getStatus()).toBe('active');
      manager.dispose();
    });
  });

  describe('delay sync', () => {
    it('measures delay and emits notification', async () => {
      const manager = await initManager();
      const notifications: AudioInterfaceNotification[] = [];
      manager.onNotification((n) => notifications.push(n));

      const remoteTimestamp = Date.now() - 30;
      const result = manager.measureDelaySync(remoteTimestamp);

      expect(result.pingMs).toBeGreaterThanOrEqual(0);
      expect(result.compensationMs).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeGreaterThan(0);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('delay_sync_complete');
      expect(notifications[0].delaySyncResult).toBeDefined();

      manager.dispose();
    });
  });

  describe('notification subscription', () => {
    it('onNotification returns unsubscribe function', async () => {
      const manager = await initManager();
      const notifications: AudioInterfaceNotification[] = [];
      const unsub = manager.onNotification((n) => notifications.push(n));

      manager.selectInput('nonexistent');
      expect(notifications).toHaveLength(1);

      unsub();
      manager.selectOutput('nonexistent');
      expect(notifications).toHaveLength(1); // No new notification

      manager.dispose();
    });

    it('handles listener errors gracefully', async () => {
      const manager = await initManager();
      const goodNotifications: AudioInterfaceNotification[] = [];

      manager.onNotification(() => { throw new Error('listener error'); });
      manager.onNotification((n) => goodNotifications.push(n));

      manager.selectInput('nonexistent');

      expect(goodNotifications).toHaveLength(1);
      manager.dispose();
    });
  });

  describe('dispose', () => {
    it('cleans up all state', async () => {
      const manager = await initManager();
      manager.selectInput('input-1');
      manager.selectOutput('output-1');

      manager.dispose();

      expect(manager.getDevices()).toEqual([]);
      expect(manager.getChannelSelection().inputDeviceId).toBeNull();
      expect(manager.getChannelSelection().outputDeviceId).toBeNull();
      expect(manager.getStatus()).toBe('idle');
    });

    it('removes devicechange listener', async () => {
      const manager = await initManager();
      manager.dispose();

      expect(navigator.mediaDevices.removeEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function),
      );
    });
  });
});
