import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRunOfEight,
  checkFourNearLimit,
  checkOutsideLimit,
  DataStatus,
} from '../../js/testable';
import {
  createDataValues,
  EMPTY_DATA,
  SINGLE_VALUE_DATA,
} from '../fixtures';

describe('checkRunOfEight', () => {
  it('does nothing for less than 8 data points', () => {
    const data = createDataValues([100, 110, 105, 108, 112, 115, 111]);
    checkRunOfEight(data, 100);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('marks 8 consecutive points above average', () => {
    const data = createDataValues([
      110, 115, 120, 125, 130, 135, 140, 145, 50, 55
    ]);
    checkRunOfEight(data, 100);
    for (let i = 0; i < 8; i++) {
      expect(data[i].status).toBe(DataStatus.RUN_OF_EIGHT_EXCEPTION);
    }
    expect(data[8].status).toBe(DataStatus.NORMAL);
    expect(data[9].status).toBe(DataStatus.NORMAL);
  });

  it('marks 8 consecutive points below average', () => {
    const data = createDataValues([
      90, 85, 80, 75, 70, 65, 60, 55, 150, 155
    ]);
    checkRunOfEight(data, 100);
    for (let i = 0; i < 8; i++) {
      expect(data[i].status).toBe(DataStatus.RUN_OF_EIGHT_EXCEPTION);
    }
  });

  it('does not mark when alternating above/below', () => {
    const data = createDataValues([
      110, 90, 110, 90, 110, 90, 110, 90, 110, 90
    ]);
    checkRunOfEight(data, 100);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('marks run starting in the middle of data', () => {
    const data = createDataValues([
      90, 110, 115, 120, 125, 130, 135, 140, 145, 150
    ]);
    checkRunOfEight(data, 100);
    expect(data[0].status).toBe(DataStatus.NORMAL);
    for (let i = 1; i < 9; i++) {
      expect(data[i].status).toBe(DataStatus.RUN_OF_EIGHT_EXCEPTION);
    }
  });

  it('handles empty array for avg parameter', () => {
    const data = createDataValues([100, 110, 105, 108, 112, 115, 111, 109]);
    checkRunOfEight(data, []);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('works with array of averages', () => {
    const data = createDataValues([
      110, 115, 120, 125, 130, 135, 140, 145
    ]);
    const avgArray = createDataValues([
      100, 100, 100, 100, 100, 100, 100, 100
    ]);
    checkRunOfEight(data, avgArray);
    for (let i = 0; i < 8; i++) {
      expect(data[i].status).toBe(DataStatus.RUN_OF_EIGHT_EXCEPTION);
    }
  });
});

describe('checkFourNearLimit', () => {
  it('does nothing for less than 4 data points', () => {
    const data = createDataValues([100, 200, 195]);
    checkFourNearLimit(data, 50, 150);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('marks 3 out of 4 points above upper quartile', () => {
    const data = createDataValues([200, 195, 198, 190]);
    checkFourNearLimit(data, 50, 150);
    for (let i = 0; i < 4; i++) {
      expect(data[i].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    }
  });

  it('marks 3 out of 4 points below lower quartile', () => {
    const data = createDataValues([40, 45, 42, 48]);
    checkFourNearLimit(data, 50, 150);
    for (let i = 0; i < 4; i++) {
      expect(data[i].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    }
  });

  it('does not mark when only 2 out of 4 near limit', () => {
    const data = createDataValues([200, 100, 195, 100]);
    checkFourNearLimit(data, 50, 150);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('handles sliding window correctly', () => {
    const data = createDataValues([100, 100, 200, 195, 198, 190, 100, 100]);
    checkFourNearLimit(data, 50, 150);
    expect(data[0].status).toBe(DataStatus.NORMAL);
    expect(data[1].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    expect(data[2].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    expect(data[3].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    expect(data[4].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    expect(data[5].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
  });

  it('handles empty array for quartile parameters', () => {
    const data = createDataValues([100, 200, 195, 198]);
    checkFourNearLimit(data, [], 150);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('works with array of quartiles', () => {
    const data = createDataValues([200, 195, 198, 190]);
    const lowerQ = createDataValues([50, 50, 50, 50]);
    const upperQ = createDataValues([150, 150, 150, 150]);
    checkFourNearLimit(data, lowerQ, upperQ);
    for (let i = 0; i < 4; i++) {
      expect(data[i].status).toBe(DataStatus.FOUR_NEAR_LIMIT_EXCEPTION);
    }
  });
});

describe('checkOutsideLimit', () => {
  it('marks points above upper limit', () => {
    const data = createDataValues([100, 100, 500, 100]);
    checkOutsideLimit(data, 0, 200);
    expect(data[0].status).toBe(DataStatus.NORMAL);
    expect(data[1].status).toBe(DataStatus.NORMAL);
    expect(data[2].status).toBe(DataStatus.NPL_EXCEPTION);
    expect(data[3].status).toBe(DataStatus.NORMAL);
  });

  it('marks points below lower limit', () => {
    const data = createDataValues([100, 100, -50, 100]);
    checkOutsideLimit(data, 0, 200);
    expect(data[2].status).toBe(DataStatus.NPL_EXCEPTION);
  });

  it('does not mark points within limits', () => {
    const data = createDataValues([50, 100, 150, 200]);
    checkOutsideLimit(data, 0, 200);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('marks points exactly on limits as normal', () => {
    const data = createDataValues([0, 100, 200]);
    checkOutsideLimit(data, 0, 200);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('handles empty array for limit parameters', () => {
    const data = createDataValues([100, 500, 100]);
    checkOutsideLimit(data, [], 200);
    expect(data.every(d => d.status === DataStatus.NORMAL)).toBe(true);
  });

  it('works with array of limits', () => {
    const data = createDataValues([100, 500, 100]);
    const lowerLimits = createDataValues([0, 0, 0]);
    const upperLimits = createDataValues([200, 200, 200]);
    checkOutsideLimit(data, lowerLimits, upperLimits);
    expect(data[0].status).toBe(DataStatus.NORMAL);
    expect(data[1].status).toBe(DataStatus.NPL_EXCEPTION);
    expect(data[2].status).toBe(DataStatus.NORMAL);
  });

  it('handles negative limits', () => {
    const data = createDataValues([-150, -50, 0]);
    checkOutsideLimit(data, -100, 100);
    expect(data[0].status).toBe(DataStatus.NPL_EXCEPTION);
    expect(data[1].status).toBe(DataStatus.NORMAL);
    expect(data[2].status).toBe(DataStatus.NORMAL);
  });
});
