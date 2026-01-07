import { describe, it, expect } from 'vitest';
import { csvTestingParser, DataStatus } from '../../js/testable';
import {
  VALID_CSV,
  CSV_MISSING_LABELS,
  CSV_MISSING_DATE_LABEL,
  CSV_WRONG_DATE_LABEL,
  CSV_INVALID_DATE,
  CSV_INVALID_VALUE,
  CSV_FRAGMENTED,
  CSV_LARGE_VALUES,
} from '../fixtures';

describe('csvTestingParser', () => {
  describe('valid CSV', () => {
    it('parses valid CSV correctly', () => {
      const result = csvTestingParser(VALID_CSV);
      expect(result.passed).toBe(true);
      expect(result.xLabel).toBe('Date');
      expect(result.yLabel).toBe('Value');
      expect(result.xdata).toHaveLength(3);
    });

    it('extracts correct values', () => {
      const result = csvTestingParser(VALID_CSV);
      expect(result.xdata[0].x).toBe('2020-01-01');
      expect(result.xdata[0].value).toBe(100);
      expect(result.xdata[1].value).toBe(200);
      expect(result.xdata[2].value).toBe(150);
    });

    it('sets correct order for each row', () => {
      const result = csvTestingParser(VALID_CSV);
      expect(result.xdata[0].order).toBe(0);
      expect(result.xdata[1].order).toBe(1);
      expect(result.xdata[2].order).toBe(2);
    });

    it('sets status to NORMAL', () => {
      const result = csvTestingParser(VALID_CSV);
      result.xdata.forEach((d) => {
        expect(d.status).toBe(DataStatus.NORMAL);
      });
    });
  });

  describe('invalid CSV - labels', () => {
    it('fails when no line break (missing labels and data)', () => {
      const result = csvTestingParser('Date,Value');
      expect(result.passed).toBe(false);
      expect(result.error).toContain('Missing CSV labels');
    });

    it('fails when first row has less than 2 columns', () => {
      const result = csvTestingParser('Date\r\n2020-01-01,100');
      expect(result.passed).toBe(false);
      expect(result.error).toContain('2 columns');
    });

    it('fails when date label is empty', () => {
      const result = csvTestingParser(CSV_MISSING_DATE_LABEL);
      expect(result.passed).toBe(false);
      expect(result.error).toContain('Missing CSV label');
    });

    it('fails when first column is not Date', () => {
      const result = csvTestingParser(CSV_WRONG_DATE_LABEL);
      expect(result.passed).toBe(false);
      expect(result.error).toContain("First column of CSV must be 'Date'");
    });
  });

  describe('invalid CSV - data', () => {
    it('fails when date is invalid', () => {
      const result = csvTestingParser(CSV_INVALID_DATE);
      expect(result.passed).toBe(false);
      expect(result.error).toContain('date');
    });

    it('fails when value is not a number', () => {
      const result = csvTestingParser(CSV_INVALID_VALUE);
      expect(result.passed).toBe(false);
      expect(result.error).toContain('numbers');
    });

    it('fails for fragmented data (gaps with data after)', () => {
      const result = csvTestingParser(CSV_FRAGMENTED);
      expect(result.passed).toBe(false);
      expect(result.error).toContain('Fragmented');
    });

    it('passes when trailing empty rows exist', () => {
      const csv = `Date,Value\r\n2020-01-01,100\r\n,`;
      const result = csvTestingParser(csv);
      expect(result.passed).toBe(true);
      expect(result.xdata).toHaveLength(1);
    });
  });

  describe('multiplier handling', () => {
    it('sets multiplier for large values', () => {
      const result = csvTestingParser(CSV_LARGE_VALUES);
      expect(result.passed).toBe(true);
      expect(result.multiplier).toBeGreaterThan(0);
    });

    it('multiplier is 0 for normal values', () => {
      const result = csvTestingParser(VALID_CSV);
      expect(result.multiplier).toBe(0);
    });
  });

  describe('custom delimiter', () => {
    it('parses with semicolon delimiter', () => {
      const csv = `Date;Value\r\n2020-01-01;100\r\n2020-01-02;200`;
      const result = csvTestingParser(csv, ';');
      expect(result.passed).toBe(true);
      expect(result.xdata).toHaveLength(2);
    });

    it('parses with tab delimiter', () => {
      const csv = `Date\tValue\r\n2020-01-01\t100\r\n2020-01-02\t200`;
      const result = csvTestingParser(csv, '\t');
      expect(result.passed).toBe(true);
      expect(result.xdata).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('handles negative values', () => {
      const csv = `Date,Value\r\n2020-01-01,-100\r\n2020-01-02,-200`;
      const result = csvTestingParser(csv);
      expect(result.passed).toBe(true);
      expect(result.xdata[0].value).toBe(-100);
    });

    it('handles decimal values', () => {
      const csv = `Date,Value\r\n2020-01-01,100.5\r\n2020-01-02,200.75`;
      const result = csvTestingParser(csv);
      expect(result.passed).toBe(true);
      expect(result.xdata[0].value).toBe(100.5);
    });

    it('handles zero values', () => {
      const csv = `Date,Value\r\n2020-01-01,0\r\n2020-01-02,0`;
      const result = csvTestingParser(csv);
      expect(result.passed).toBe(true);
      expect(result.xdata[0].value).toBe(0);
    });

    it('preserves custom y-axis label', () => {
      const csv = `Date,Revenue\r\n2020-01-01,100`;
      const result = csvTestingParser(csv);
      expect(result.yLabel).toBe('Revenue');
    });
  });
});
