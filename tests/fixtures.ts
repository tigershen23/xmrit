import { DataValue, DataStatus } from '../js/testable';

export function createDataValue(order: number, x: string, value: number, status: DataStatus = DataStatus.NORMAL): DataValue {
  return { order, x, value, status };
}

export function createDataValues(values: number[], startDate: string = '2020-01-01'): DataValue[] {
  const start = new Date(startDate);
  return values.map((value, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return createDataValue(i, date.toISOString().slice(0, 10), value);
  });
}

export function createWeeklyDataValues(values: number[], startDate: string = '2020-01-01'): DataValue[] {
  const start = new Date(startDate);
  return values.map((value, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i * 7);
    return createDataValue(i, date.toISOString().slice(0, 10), value);
  });
}

export function createMonthlyDataValues(values: number[], startDate: string = '2020-01-01'): DataValue[] {
  const start = new Date(startDate);
  return values.map((value, i) => {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    return createDataValue(i, date.toISOString().slice(0, 10), value);
  });
}

export const SAMPLE_DATA = createDataValues([
  5045, 4350, 4350, 3975, 4290, 4430, 4485, 4285, 3980, 3925, 3645, 3760, 3300,
  3685, 3463, 5200,
]);

export const RUN_OF_EIGHT_ABOVE_DATA = createDataValues([
  100, 110, 105, 108, 112, 115, 111, 109, 107, 50, 55, 52
]);

export const RUN_OF_EIGHT_BELOW_DATA = createDataValues([
  100, 90, 85, 88, 82, 75, 81, 79, 77, 150, 155, 152
]);

export const FOUR_NEAR_LIMIT_DATA = createDataValues([
  100, 200, 195, 198, 190, 100, 100, 100
]);

export const OUTSIDE_LIMIT_DATA = createDataValues([
  100, 100, 100, 500, 100, 100, -200, 100
]);

export const SINGLE_VALUE_DATA = createDataValues([100]);

export const TWO_VALUE_DATA = createDataValues([100, 200]);

export const EMPTY_DATA: DataValue[] = [];

export const NEGATIVE_VALUES_DATA = createDataValues([-100, -50, -75, -25, -60]);

export const ZERO_VALUES_DATA = createDataValues([0, 0, 0, 0, 0]);

export const MIXED_VALUES_DATA = createDataValues([-50, 0, 50, 100, -100]);

export const WEEKLY_DATA = createWeeklyDataValues([100, 110, 105, 115, 108, 112, 120, 118]);

export const MONTHLY_DATA = createMonthlyDataValues([
  1000, 1100, 1050, 1150, 1080, 1120, 1200, 1180, 1250, 1300, 1280, 1350
]);

export const VALID_CSV = `Date,Value\r\n2020-01-01,100\r\n2020-01-02,200\r\n2020-01-03,150`;

export const CSV_MISSING_LABELS = `\r\n2020-01-01,100`;

export const CSV_MISSING_DATE_LABEL = `,Value\r\n2020-01-01,100`;

export const CSV_WRONG_DATE_LABEL = `Time,Value\r\n2020-01-01,100`;

export const CSV_INVALID_DATE = `Date,Value\r\ninvalid-date,100`;

export const CSV_INVALID_VALUE = `Date,Value\r\n2020-01-01,not-a-number`;

export const CSV_FRAGMENTED = `Date,Value\r\n2020-01-01,100\r\n,\r\n2020-01-03,150`;

export const CSV_LARGE_VALUES = `Date,Value\r\n2020-01-01,50000000\r\n2020-01-02,60000000`;
