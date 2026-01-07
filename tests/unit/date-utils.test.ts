import { describe, it, expect } from 'vitest';
import {
  fromDateStr,
  toDateStr,
  determinePeriodicity,
  sortDataValues,
} from '../../js/testable';
import {
  createDataValues,
  createWeeklyDataValues,
  createMonthlyDataValues,
  SAMPLE_DATA,
} from '../fixtures';

describe('fromDateStr', () => {
  it('converts date string to unix timestamp', () => {
    const timestamp = fromDateStr('2020-01-01');
    expect(typeof timestamp).toBe('number');
    expect(timestamp).toBeGreaterThan(0);
  });

  it('returns consistent values for same date', () => {
    const t1 = fromDateStr('2020-06-15');
    const t2 = fromDateStr('2020-06-15');
    expect(t1).toBe(t2);
  });

  it('later dates have larger timestamps', () => {
    const t1 = fromDateStr('2020-01-01');
    const t2 = fromDateStr('2020-12-31');
    expect(t2).toBeGreaterThan(t1);
  });

  it('handles various date formats', () => {
    const t1 = fromDateStr('2020-01-15');
    const t2 = fromDateStr('2020/01/15');
    expect(t1).toBe(t2);
  });
});

describe('toDateStr', () => {
  it('converts Date to YYYY-MM-DD string', () => {
    const date = new Date(2020, 0, 15);
    const str = toDateStr(date);
    expect(str).toBe('2020-01-15');
  });

  it('pads single digit months and days', () => {
    const date = new Date(2020, 0, 5);
    const str = toDateStr(date);
    expect(str).toBe('2020-01-05');
  });

  it('handles end of year', () => {
    const date = new Date(2020, 11, 31);
    const str = toDateStr(date);
    expect(str).toBe('2020-12-31');
  });
});

describe('determinePeriodicity', () => {
  it('detects daily data', () => {
    const data = createDataValues([100, 110, 105, 115, 108]);
    expect(determinePeriodicity(data)).toBe('day');
  });

  it('detects weekly data', () => {
    const data = createWeeklyDataValues([100, 110, 105, 115, 108]);
    expect(determinePeriodicity(data)).toBe('week');
  });

  it('detects monthly data', () => {
    const data = createMonthlyDataValues([100, 110, 105, 115, 108]);
    expect(determinePeriodicity(data)).toBe('month');
  });

  it('detects quarterly data', () => {
    const start = new Date('2020-01-01');
    const data = [0, 1, 2, 3, 4].map((i) => {
      const date = new Date(start);
      date.setMonth(date.getMonth() + i * 3);
      return {
        order: i,
        x: date.toISOString().slice(0, 10),
        value: 100 + i * 10,
        status: 0 as const,
      };
    });
    expect(determinePeriodicity(data)).toBe('quarter');
  });

  it('handles sample data', () => {
    const periodicity = determinePeriodicity(SAMPLE_DATA);
    expect(['day', 'week', 'month', 'quarter', 'year']).toContain(periodicity);
  });
});

describe('sortDataValues', () => {
  it('sorts data by date ascending', () => {
    const data = [
      { order: 0, x: '2020-01-15', value: 100, status: 0 as const },
      { order: 1, x: '2020-01-01', value: 200, status: 0 as const },
      { order: 2, x: '2020-01-10', value: 150, status: 0 as const },
    ];
    const sorted = sortDataValues(data);
    expect(sorted[0].x).toBe('2020-01-01');
    expect(sorted[1].x).toBe('2020-01-10');
    expect(sorted[2].x).toBe('2020-01-15');
  });

  it('handles already sorted data', () => {
    const data = createDataValues([100, 200, 300]);
    const sorted = sortDataValues([...data]);
    expect(sorted[0].x).toBe(data[0].x);
    expect(sorted[1].x).toBe(data[1].x);
    expect(sorted[2].x).toBe(data[2].x);
  });

  it('handles single element', () => {
    const data = [{ order: 0, x: '2020-01-01', value: 100, status: 0 as const }];
    const sorted = sortDataValues(data);
    expect(sorted).toHaveLength(1);
  });

  it('handles empty array', () => {
    const sorted = sortDataValues([]);
    expect(sorted).toHaveLength(0);
  });

  it('sorts in place (mutates original)', () => {
    const data = [
      { order: 0, x: '2020-01-15', value: 100, status: 0 as const },
      { order: 1, x: '2020-01-01', value: 200, status: 0 as const },
    ];
    sortDataValues(data);
    expect(data[0].x).toBe('2020-01-01');
  });
});
