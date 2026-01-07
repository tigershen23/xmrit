import { describe, it, expect } from 'vitest';
import {
  encodeNumberArrayString,
  decodeNumberArrayString,
  btoaUrlSafe,
  atobUrlSafe,
} from '../../js/testable';

describe('btoaUrlSafe / atobUrlSafe', () => {
  it('encodes and decodes simple string', () => {
    const original = 'Hello, World!';
    const encoded = btoaUrlSafe(original);
    const decoded = atobUrlSafe(encoded);
    expect(decoded).toBe(original);
  });

  it('produces URL-safe output (no +, /, =)', () => {
    const original = 'Test string with special chars: +/=';
    const encoded = btoaUrlSafe(original);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('handles empty string', () => {
    const encoded = btoaUrlSafe('');
    const decoded = atobUrlSafe(encoded);
    expect(decoded).toBe('');
  });

  it('handles binary-like content', () => {
    const original = String.fromCharCode(0, 1, 2, 255, 254, 253);
    const encoded = btoaUrlSafe(original);
    const decoded = atobUrlSafe(encoded);
    expect(decoded).toBe(original);
  });
});

describe('encodeNumberArrayString / decodeNumberArrayString', () => {
  it('roundtrips simple integer array', () => {
    const original = [1, 2, 3, 4, 5];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    original.forEach((val, i) => {
      expect(decoded[i]).toBeCloseTo(val, 5);
    });
  });

  it('roundtrips floating point numbers', () => {
    const original = [1.5, 2.25, 3.125, 4.0625];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    original.forEach((val, i) => {
      expect(decoded[i]).toBeCloseTo(val, 4);
    });
  });

  it('roundtrips negative numbers', () => {
    const original = [-100, -50.5, 0, 50.5, 100];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    original.forEach((val, i) => {
      expect(decoded[i]).toBeCloseTo(val, 4);
    });
  });

  it('roundtrips large numbers', () => {
    const original = [1000000, 5000000, 10000000];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    original.forEach((val, i) => {
      expect(decoded[i]).toBeCloseTo(val, 0);
    });
  });

  it('roundtrips small decimal numbers', () => {
    const original = [0.001, 0.0001, 0.00001];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    original.forEach((val, i) => {
      expect(decoded[i]).toBeCloseTo(val, 5);
    });
  });

  it('handles empty array', () => {
    const original: number[] = [];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    expect(decoded).toHaveLength(0);
  });

  it('handles single element', () => {
    const original = [42.5];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    expect(decoded[0]).toBeCloseTo(42.5, 4);
  });

  it('produces URL-safe output', () => {
    const original = [100, 200, 300, 400, 500];
    const encoded = encodeNumberArrayString(original);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('handles zero', () => {
    const original = [0, 0, 0];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    decoded.forEach((val) => {
      expect(val).toBe(0);
    });
  });

  it('handles typical XmR chart values', () => {
    const original = [5045, 4350, 4350, 3975, 4290, 4430, 4485, 4285];
    const encoded = encodeNumberArrayString(original);
    const decoded = decodeNumberArrayString(encoded);
    original.forEach((val, i) => {
      expect(decoded[i]).toBeCloseTo(val, 0);
    });
  });
});
