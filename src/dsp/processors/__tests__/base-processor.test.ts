import { describe, it, expect } from 'vitest';
import {
  lerp,
  dbToLinear,
  linearToDb,
  clamp,
  ParameterSmoother,
  MessagePortHandler,
} from '../base-processor';

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(2, 8, 0)).toBe(2);
  });

  it('returns b when t=1', () => {
    expect(lerp(2, 8, 1)).toBe(8);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe('dbToLinear / linearToDb', () => {
  it('0 dB equals gain of 1', () => {
    expect(dbToLinear(0)).toBeCloseTo(1);
  });

  it('-20 dB equals gain of 0.1', () => {
    expect(dbToLinear(-20)).toBeCloseTo(0.1);
  });

  it('+6 dB is approximately 2', () => {
    expect(dbToLinear(6)).toBeCloseTo(1.9953, 3);
  });

  it('round-trips correctly', () => {
    const db = -12;
    expect(linearToDb(dbToLinear(db))).toBeCloseTo(db);
  });

  it('linearToDb of 0 returns -Infinity', () => {
    expect(linearToDb(0)).toBe(-Infinity);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('ParameterSmoother', () => {
  it('starts at the initial value', () => {
    const s = new ParameterSmoother(0.5, 10, 44100);
    expect(s.getValue()).toBe(0.5);
  });

  it('converges towards the target over time', () => {
    const s = new ParameterSmoother(0, 5, 44100);
    s.setTarget(1);
    // Advance many samples
    for (let i = 0; i < 44100; i++) s.next();
    expect(s.getValue()).toBeCloseTo(1, 3);
  });

  it('snap() jumps immediately to target', () => {
    const s = new ParameterSmoother(0, 100, 44100);
    s.setTarget(1);
    s.snap();
    expect(s.getValue()).toBe(1);
  });

  it('getTarget returns the set target', () => {
    const s = new ParameterSmoother(0, 10, 44100);
    s.setTarget(0.75);
    expect(s.getTarget()).toBe(0.75);
  });

  it('with zero smoothing time, reaches target in one sample', () => {
    const s = new ParameterSmoother(0, 0, 44100);
    s.setTarget(1);
    const val = s.next();
    expect(val).toBe(1);
  });
});

describe('MessagePortHandler', () => {
  it('sends messages through the port', () => {
    const handler = new MessagePortHandler();
    const messages: unknown[] = [];
    const fakePort = {
      onmessage: null as unknown,
      postMessage: (msg: unknown) => messages.push(msg),
    } as unknown as MessagePort;

    handler.attach(fakePort);
    handler.send({ type: 'test', value: 42 });
    expect(messages).toEqual([{ type: 'test', value: 42 }]);
  });

  it('receives messages via onMessage', () => {
    const received: unknown[] = [];

    class TestHandler extends MessagePortHandler {
      onMessage(msg: { type: string; [key: string]: unknown }) {
        received.push(msg);
      }
    }

    const handler = new TestHandler();
    const fakePort = {
      onmessage: null as ((ev: MessageEvent) => void) | null,
      postMessage: () => {},
    };

    handler.attach(fakePort as unknown as MessagePort);

    // Simulate incoming message
    fakePort.onmessage?.({ data: { type: 'hello' } } as MessageEvent);
    expect(received).toEqual([{ type: 'hello' }]);
  });
});
