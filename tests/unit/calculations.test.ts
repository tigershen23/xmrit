import { describe, it, expect } from 'vitest';
import {
  calculateLimits,
  calculateMedian,
  getMovements,
  calculateRegressionStats,
  linearRegression,
  round,
  average,
  sum,
} from '../../js/testable';
import {
  SAMPLE_DATA,
  SINGLE_VALUE_DATA,
  TWO_VALUE_DATA,
  EMPTY_DATA,
  NEGATIVE_VALUES_DATA,
  ZERO_VALUES_DATA,
  MIXED_VALUES_DATA,
  createDataValues,
} from '../fixtures';

describe('calculateMedian', () => {
  it('returns 0 for empty array', () => {
    expect(calculateMedian([])).toBe(0);
  });

  it('returns the single value for array of one', () => {
    expect(calculateMedian([5])).toBe(5);
  });

  it('returns middle value for odd-length array', () => {
    expect(calculateMedian([1, 3, 5])).toBe(3);
    expect(calculateMedian([10, 20, 30, 40, 50])).toBe(30);
  });

  it('returns average of two middle values for even-length array', () => {
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
  });

  it('handles unsorted input', () => {
    expect(calculateMedian([5, 1, 3])).toBe(3);
    expect(calculateMedian([40, 10, 30, 20])).toBe(25);
  });

  it('handles negative values', () => {
    expect(calculateMedian([-5, -1, -3])).toBe(-3);
  });
});

describe('getMovements', () => {
  it('returns empty array for single data point', () => {
    expect(getMovements(SINGLE_VALUE_DATA)).toEqual([]);
  });

  it('returns empty array for empty data', () => {
    expect(getMovements(EMPTY_DATA)).toEqual([]);
  });

  it('calculates absolute differences between consecutive values', () => {
    const data = createDataValues([100, 150, 120]);
    const movements = getMovements(data);
    expect(movements).toHaveLength(2);
    expect(movements[0].value).toBe(50);
    expect(movements[1].value).toBe(30);
  });

  it('handles negative values correctly (absolute difference)', () => {
    const data = createDataValues([100, 50, 80]);
    const movements = getMovements(data);
    expect(movements[0].value).toBe(50);
    expect(movements[1].value).toBe(30);
  });

  it('preserves date from the second value in each pair', () => {
    const data = createDataValues([100, 200, 300]);
    const movements = getMovements(data);
    expect(movements[0].x).toBe(data[1].x);
    expect(movements[1].x).toBe(data[2].x);
  });
});

describe('calculateLimits', () => {
  it('calculates limits for sample data', () => {
    const limits = calculateLimits(SAMPLE_DATA);
    expect(limits.avgX).toBeDefined();
    expect(limits.avgMovement).toBeDefined();
    expect(limits.UNPL).toBeDefined();
    expect(limits.LNPL).toBeDefined();
    expect(limits.URL).toBeDefined();
    expect(limits.lowerQuartile).toBeDefined();
    expect(limits.upperQuartile).toBeDefined();
  });

  it('UNPL is greater than avgX', () => {
    const limits = calculateLimits(SAMPLE_DATA);
    expect(limits.UNPL!).toBeGreaterThan(limits.avgX!);
  });

  it('LNPL is less than avgX', () => {
    const limits = calculateLimits(SAMPLE_DATA);
    expect(limits.LNPL!).toBeLessThan(limits.avgX!);
  });

  it('quartiles are between avgX and limits', () => {
    const limits = calculateLimits(SAMPLE_DATA);
    expect(limits.upperQuartile!).toBeLessThan(limits.UNPL!);
    expect(limits.upperQuartile!).toBeGreaterThan(limits.avgX!);
    expect(limits.lowerQuartile!).toBeGreaterThan(limits.LNPL!);
    expect(limits.lowerQuartile!).toBeLessThan(limits.avgX!);
  });

  it('handles single value (no movements)', () => {
    const limits = calculateLimits(SINGLE_VALUE_DATA);
    expect(limits.avgX).toBe(100);
    expect(limits.avgMovement).toBe(0);
  });

  it('handles two values', () => {
    const limits = calculateLimits(TWO_VALUE_DATA);
    expect(limits.avgX).toBe(150);
    expect(limits.avgMovement).toBe(100);
  });

  it('handles negative values', () => {
    const limits = calculateLimits(NEGATIVE_VALUES_DATA);
    expect(limits.avgX).toBeDefined();
    expect(limits.LNPL!).toBeLessThan(limits.avgX!);
  });

  it('handles zero values', () => {
    const limits = calculateLimits(ZERO_VALUES_DATA);
    expect(limits.avgX).toBe(0);
    expect(limits.avgMovement).toBe(0);
  });

  it('handles mixed positive and negative values', () => {
    const limits = calculateLimits(MIXED_VALUES_DATA);
    expect(limits.avgX).toBeDefined();
  });
});

describe('linearRegression', () => {
  it('returns null for less than 2 data points', () => {
    expect(linearRegression(SINGLE_VALUE_DATA, SINGLE_VALUE_DATA)).toBeNull();
    expect(linearRegression(EMPTY_DATA, EMPTY_DATA)).toBeNull();
  });

  it('calculates slope and intercept for linear data', () => {
    const data = createDataValues([100, 200, 300, 400, 500]);
    const result = linearRegression(data, data);
    expect(result).not.toBeNull();
    expect(result!.m).toBeCloseTo(100, 0);
  });

  it('calculates flat line for constant data', () => {
    const data = createDataValues([100, 100, 100, 100]);
    const result = linearRegression(data, data);
    expect(result).not.toBeNull();
    expect(result!.m).toBeCloseTo(0, 5);
    expect(result!.c).toBeCloseTo(100, 0);
  });
});

describe('calculateRegressionStats', () => {
  it('returns regression stats with m, c, and avgMR', () => {
    const stats = calculateRegressionStats(SAMPLE_DATA);
    expect(stats).toHaveProperty('m');
    expect(stats).toHaveProperty('c');
    expect(stats).toHaveProperty('avgMR');
  });

  it('avgMR is positive for varying data', () => {
    const stats = calculateRegressionStats(SAMPLE_DATA);
    expect(stats.avgMR).toBeGreaterThan(0);
  });

  it('handles two values', () => {
    const stats = calculateRegressionStats(TWO_VALUE_DATA);
    expect(stats.avgMR).toBe(100);
  });
});

describe('round', () => {
  it('rounds to 2 decimal places by default', () => {
    expect(round(3.14159)).toBe(3.14);
    expect(round(2.005)).toBe(2.01);
    expect(round(2.004)).toBe(2);
  });

  it('rounds to specified decimal places', () => {
    expect(round(3.14159, 4)).toBe(3.1416);
    expect(round(3.14159, 0)).toBe(3);
    expect(round(3.5, 0)).toBe(4);
  });

  it('handles negative numbers', () => {
    expect(round(-3.14159)).toBe(-3.14);
    expect(round(-2.005)).toBe(-2);
  });
});

describe('average', () => {
  it('calculates average of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
    expect(average([10, 20])).toBe(15);
  });

  it('handles single value', () => {
    expect(average([5])).toBe(5);
  });
});

describe('sum', () => {
  it('calculates sum of numbers', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
    expect(sum([10, 20])).toBe(30);
  });

  it('handles single value', () => {
    expect(sum([5])).toBe(5);
  });

  it('handles negative values', () => {
    expect(sum([-5, 5])).toBe(0);
  });
});
