import { describe, it, expect } from 'vitest';
import {
  deepClone,
  removeAllNulls,
  DataStatus,
} from '../../js/testable';
import {
  createDataValues,
  SAMPLE_DATA,
  EMPTY_DATA,
} from '../fixtures';

describe('deepClone', () => {
  it('creates a copy of the array', () => {
    const original = createDataValues([100, 200, 300]);
    const cloned = deepClone(original);
    expect(cloned).toHaveLength(original.length);
    expect(cloned).not.toBe(original);
  });

  it('cloned objects are independent', () => {
    const original = createDataValues([100, 200, 300]);
    const cloned = deepClone(original);
    cloned[0].value = 999;
    expect(original[0].value).toBe(100);
  });

  it('preserves all properties', () => {
    const original = createDataValues([100, 200]);
    const cloned = deepClone(original);
    expect(cloned[0].x).toBe(original[0].x);
    expect(cloned[0].value).toBe(original[0].value);
    expect(cloned[0].order).toBe(original[0].order);
    expect(cloned[0].status).toBe(original[0].status);
  });

  it('handles empty array', () => {
    const cloned = deepClone([]);
    expect(cloned).toHaveLength(0);
  });

  it('handles sample data', () => {
    const cloned = deepClone(SAMPLE_DATA);
    expect(cloned).toHaveLength(SAMPLE_DATA.length);
    cloned[0].value = 0;
    expect(SAMPLE_DATA[0].value).not.toBe(0);
  });
});

describe('removeAllNulls', () => {
  it('removes entries with null x', () => {
    const data = [
      { order: 0, x: '2020-01-01', value: 100, status: DataStatus.NORMAL },
      { order: 1, x: null as any, value: 200, status: DataStatus.NORMAL },
      { order: 2, x: '2020-01-03', value: 300, status: DataStatus.NORMAL },
    ];
    const filtered = removeAllNulls(data);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].x).toBe('2020-01-01');
    expect(filtered[1].x).toBe('2020-01-03');
  });

  it('removes entries with empty string x', () => {
    const data = [
      { order: 0, x: '2020-01-01', value: 100, status: DataStatus.NORMAL },
      { order: 1, x: '', value: 200, status: DataStatus.NORMAL },
    ];
    const filtered = removeAllNulls(data);
    expect(filtered).toHaveLength(1);
  });

  it('keeps entries with value 0', () => {
    const data = [
      { order: 0, x: '2020-01-01', value: 0, status: DataStatus.NORMAL },
      { order: 1, x: '2020-01-02', value: 100, status: DataStatus.NORMAL },
    ];
    const filtered = removeAllNulls(data);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].value).toBe(0);
  });

  it('removes entries with null value', () => {
    const data = [
      { order: 0, x: '2020-01-01', value: 100, status: DataStatus.NORMAL },
      { order: 1, x: '2020-01-02', value: null as any, status: DataStatus.NORMAL },
    ];
    const filtered = removeAllNulls(data);
    expect(filtered).toHaveLength(1);
  });

  it('handles empty array', () => {
    const filtered = removeAllNulls([]);
    expect(filtered).toHaveLength(0);
  });

  it('returns all entries when all valid', () => {
    const filtered = removeAllNulls(SAMPLE_DATA);
    expect(filtered).toHaveLength(SAMPLE_DATA.length);
  });

  it('does not mutate original array', () => {
    const data = [
      { order: 0, x: '2020-01-01', value: 100, status: DataStatus.NORMAL },
      { order: 1, x: null as any, value: 200, status: DataStatus.NORMAL },
    ];
    const originalLength = data.length;
    removeAllNulls(data);
    expect(data).toHaveLength(originalLength);
  });
});
