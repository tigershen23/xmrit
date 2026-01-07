import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(duration);
dayjs.extend(quarterOfYear);

export type DataValue = {
  order: number;
  x: string;
  value: number;
  status: DataStatus;
  seasonalFactor?: number;
};

export enum DataStatus {
  NORMAL = 0,
  RUN_OF_EIGHT_EXCEPTION = 1,
  FOUR_NEAR_LIMIT_EXCEPTION = 2,
  NPL_EXCEPTION = 3,
}

export type LineValueType = {
  xLeft: number;
  xRight: number;
  avgX: number;
  avgMovement?: number;
  UNPL?: number;
  LNPL?: number;
  URL?: number;
  lowerQuartile?: number;
  upperQuartile?: number;
};

export type SeasonalityPeriod = "year" | "quarter" | "month" | "week";
export type SeasonalityGrouping = "week" | "month" | "quarter";

const NPL_SCALING = 2.66;
const URL_SCALING = 3.268;
const USE_MEDIAN_AVG = false;
const USE_MEDIAN_MR = false;
const MEDIAN_NPL_SCALING = 3.145;
const MEDIAN_URL_SCALING = 3.865;
const DECIMAL_POINT = 2;

export function checkRunOfEight(data: DataValue[], avg: number | DataValue[]) {
  if (typeof avg !== "number" && avg.length < 1) return;

  const avgValue = (i: number) => (typeof avg !== "number" ? avg[i].value : avg);

  if (data.length < 8) {
    return;
  }
  let aboveOrBelow = 0;
  for (let i = 0; i < 7; i++) {
    if (data[i].value > avgValue(i)) {
      aboveOrBelow |= 1 << i % 8;
    }
  }
  for (let i = 7; i < data.length; i++) {
    if (data[i].value > avgValue(i)) {
      aboveOrBelow |= 1 << i % 8;
    } else {
      aboveOrBelow &= ~(1 << i % 8);
    }
    if (aboveOrBelow == 0 || aboveOrBelow == 255) {
      for (let j = i - 7; j <= i; j++) {
        data[j].status = DataStatus.RUN_OF_EIGHT_EXCEPTION;
      }
    }
  }
  return;
}

export function checkFourNearLimit(
  data: DataValue[],
  lowerQuartile: number | DataValue[],
  upperQuartile: number | DataValue[]
) {
  if (typeof lowerQuartile !== "number" && lowerQuartile.length < 1) return;
  if (typeof upperQuartile !== "number" && upperQuartile.length < 1) return;

  const upperQuartileValue = (i: number) =>
    typeof upperQuartile !== "number" ? upperQuartile[i].value : upperQuartile;
  const lowerQuartileValue = (i: number) =>
    typeof lowerQuartile !== "number" ? lowerQuartile[i].value : lowerQuartile;

  if (data.length < 4) {
    return;
  }

  let belowQuartile = 0;
  let aboveQuartile = 0;
  for (let i = 0; i < 3; i++) {
    if (data[i].value < lowerQuartileValue(i)) {
      belowQuartile += 1;
    } else if (data[i].value > upperQuartileValue(i)) {
      aboveQuartile += 1;
    }
  }

  for (let i = 3; i < data.length; i++) {
    if (data[i].value < lowerQuartileValue(i)) {
      belowQuartile += 1;
    } else if (data[i].value > upperQuartileValue(i)) {
      aboveQuartile += 1;
    }

    if (belowQuartile >= 3 || aboveQuartile >= 3) {
      for (let j = i - 3; j <= i; j++) {
        data[j].status = DataStatus.FOUR_NEAR_LIMIT_EXCEPTION;
      }
    }

    if (data[i - 3].value < lowerQuartileValue(i - 3)) {
      belowQuartile -= 1;
    } else if (data[i - 3].value > upperQuartileValue(i - 3)) {
      aboveQuartile -= 1;
    }
  }
}

export function checkOutsideLimit(
  data: DataValue[],
  lowerLimit: number | DataValue[],
  upperLimit: number | DataValue[]
) {
  if (typeof lowerLimit !== "number" && lowerLimit.length < 1) return;
  if (typeof upperLimit !== "number" && upperLimit.length < 1) return;

  const upperLimitValue = (i: number) =>
    typeof upperLimit !== "number" ? upperLimit[i].value : upperLimit;
  const lowerLimitValue = (i: number) =>
    typeof lowerLimit !== "number" ? lowerLimit[i].value : lowerLimit;

  data.forEach((dv, i) => {
    if (dv.value < lowerLimitValue(i)) {
      dv.status = DataStatus.NPL_EXCEPTION;
    } else if (dv.value > upperLimitValue(i)) {
      dv.status = DataStatus.NPL_EXCEPTION;
    }
  });
}

export function sum(ns: number[]) {
  return ns.reduce((t, n) => t + n);
}

export function average(ns: number[]) {
  return ns.reduce((t, n) => t + n, 0) / ns.length;
}

export function round(n: number, decimal_point: number = DECIMAL_POINT): number {
  let pow = 10 ** decimal_point;
  return Math.round(n * pow) / pow;
}

export function calculateMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  if (n % 2 !== 0) {
    const middleIndex = Math.floor(n / 2);
    return sorted[middleIndex];
  } else {
    const middleIndex1 = n / 2 - 1;
    const middleIndex2 = n / 2;
    return (sorted[middleIndex1] + sorted[middleIndex2]) / 2;
  }
}

export function getMovements(xdata: DataValue[]): DataValue[] {
  const movements: DataValue[] = [];
  for (let i = 1; i < xdata.length; i++) {
    const diff = round(Math.abs(xdata[i].value - xdata[i - 1].value));
    movements.push({ order: xdata[i].order, x: xdata[i].x, value: diff, status: DataStatus.NORMAL });
  }
  return movements;
}

export function calculateLimits(xdata: DataValue[]): Partial<LineValueType> {
  const movements = getMovements(xdata);
  const avgX = USE_MEDIAN_AVG
    ? calculateMedian(xdata.map((x) => x.value))
    : xdata.reduce((a, b) => a + b.value, 0) / xdata.length;
  const avgMovement = USE_MEDIAN_MR
    ? calculateMedian(movements.map((x) => x.value))
    : movements.reduce((a, b) => a + b.value, 0) /
    Math.max(movements.length, 1);
  const delta =
    (USE_MEDIAN_MR
      ? MEDIAN_NPL_SCALING
      : NPL_SCALING) * avgMovement;
  const UNPL = avgX + delta;
  const LNPL = avgX - delta;
  const URL =
    (USE_MEDIAN_MR
      ? MEDIAN_URL_SCALING
      : URL_SCALING) * avgMovement;
  const lowerQuartile = (LNPL + avgX) / 2;
  const upperQuartile = (UNPL + avgX) / 2;
  return {
    avgX: round(avgX),
    avgMovement: round(avgMovement),
    UNPL: round(UNPL),
    LNPL: round(LNPL),
    URL: round(URL),
    lowerQuartile: round(lowerQuartile),
    upperQuartile: round(upperQuartile),
  };
}

export function fromDateStr(ds: string): number {
  return dayjs(ds).valueOf();
}

export function toDateStr(d: Date): string {
  const offset = d.getTimezoneOffset();
  d = new Date(d.getTime() - offset * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export function determinePeriodicity(xdata: DataValue[]) {
  const xValues = xdata.map((d) => dayjs(d.x));
  let deltas: number[] = [];
  for (let i = 1; i < xValues.length; i++) {
    deltas.push(xValues[i].diff(xValues[i - 1], "days"));
  }
  const diffCounts = deltas.reduce((acc: Record<number, number>, diff) => {
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {});
  const mostCommonDiff = Object.keys(diffCounts).reduce((a, b) =>
    diffCounts[Number(a)] > diffCounts[Number(b)] ? a : b
  );
  const interval = parseFloat(mostCommonDiff);
  if (interval < 7) {
    return "day";
  } else if (interval < 28) {
    return "week";
  } else if (interval < 90) {
    return "month";
  } else if (interval < 365) {
    return "quarter";
  } else {
    return "year";
  }
}

export function sortDataValues(dv: DataValue[]) {
  return dv.sort((a, b) => fromDateStr(a.x) - fromDateStr(b.x));
}

export function deepClone(src: DataValue[]): DataValue[] {
  return src.map((el) => {
    return { x: el.x, value: el.value, order: el.order, status: el.status };
  });
}

export function removeAllNulls(dv: DataValue[]) {
  return dv.filter((d) => d.x && (d.value || d.value == 0));
}

export function atobUrlSafe(s: string) {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/"));
}

export function btoaUrlSafe(s: string) {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function encodeNumberArrayString(input: number[]) {
  const buffer = new ArrayBuffer(input.length * 4);
  const view = new DataView(buffer);
  input.forEach((i, idx) => {
    view.setFloat32(idx * 4, i);
  });
  return btoaUrlSafe(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
}

export function decodeNumberArrayString(s: string) {
  const bs = atobUrlSafe(s);
  var bytes = new Uint8Array(bs.length);
  for (let i = 0; i < bs.length; i++) {
    bytes[i] = bs.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const result: number[] = [];
  for (let i = 0; i < bytes.length / 4; i++) {
    result.push(view.getFloat32(i * 4));
  }
  return result;
}

export function periodiseData(
  initialX: string,
  xdata: DataValue[],
  period: SeasonalityPeriod = "year"
): DataValue[][] {
  const dataInterval = determinePeriodicity(xdata);

  if (dataInterval === "unknown") {
    console.error("Data has an irregular interval");
    return [];
  }

  const lastDate = dayjs(xdata[xdata.length - 1].x);

  const xDataMap = xdata.reduce((acc: Record<string, DataValue>, d) => {
    acc[dayjs(d.x).toISOString()] = d;
    return acc;
  }, {});

  const periodisedData: DataValue[][] = [];

  let periodStart = dayjs(initialX).startOf(period).startOf(dataInterval as any);
  let periodEnd = dayjs(initialX).endOf(period).endOf(dataInterval as any);
  let periodDuration = periodEnd.diff(periodStart, dataInterval as any);

  let d = periodStart;
  while (d.isBefore(lastDate.add(1, "day"))) {
    const currPeriod: (DataValue | null)[] = [];
    for (let i = 0; i <= periodDuration; i++) {
      d = periodStart.add(i, dataInterval as any);
      if (!d.isBefore(lastDate.add(1, "day"))) {
        continue;
      }
      const dataPoint = xDataMap[d.toISOString()] ?? null;
      currPeriod.push(dataPoint);
    }

    periodisedData.push(currPeriod as DataValue[]);

    periodStart = periodStart.add(1, period).startOf(dataInterval as any);
    periodEnd = periodEnd.add(1, period).endOf(dataInterval as any);
    periodDuration = periodEnd.diff(periodStart, dataInterval as any);
  }

  return periodisedData;
}

export function calculateSeasonalFactors(
  xData: DataValue[],
  seasonalData: DataValue[],
  period: SeasonalityPeriod = "year",
  grouping: SeasonalityGrouping | "none" = "none"
) {
  const isGrouped = grouping !== "none";

  let periodisedData: DataValue[][];
  if (isGrouped) {
    return [[], false] as const;
  } else {
    periodisedData = periodiseData(xData[0].x, seasonalData, period);
  }

  let hasMissingSubPeriods = false;
  hasMissingSubPeriods =
    !periodisedData.every((p) => p.length === periodisedData[0].length) &&
    isGrouped;

  const subPeriodCount = Math.max(...periodisedData.map((p) => p.length));

  const subPeriodAggregates: number[] = [];
  const aggregationStrategy = isGrouped ? sum : average;

  for (let i = 0; i < subPeriodCount; i++) {
    subPeriodAggregates.push(
      aggregationStrategy(
        periodisedData
          .map((p) => p[i])
          .filter((v) => v != null)
          .map((d) => d.value)
      )
    );
  }

  const overallAvg = average(
    isGrouped
      ? subPeriodAggregates
      : seasonalData.map((d) => d.value).filter((v) => v != null)
  );

  const seasonalFactors = subPeriodAggregates.map((v) =>
    isNaN(v) ? 1 : v / overallAvg
  );

  return [seasonalFactors, hasMissingSubPeriods] as const;
}

export type RegressionStats = {
  m: number;
  c: number;
  avgMR: number;
};

export function linearRegression(yValues: DataValue[], xdata: DataValue[]): { m: number; c: number } | null {
  if (yValues.length < 2) {
    return null;
  }

  let validXData = removeAllNulls(xdata);
  if (validXData.length < 2) return null;
  
  let firstData = fromDateStr(validXData[0].x);
  let base = fromDateStr(validXData[1].x) - firstData;
  if (base === 0) return null;
  
  let normalizedValue: { x: number; y: number }[] = yValues.map((d) => {
    return {
      x: (fromDateStr(d.x) - firstData) / base,
      y: d.value,
    };
  });

  const n = yValues.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = normalizedValue[i].x;
    const y = normalizedValue[i].y;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;

  if (denominator === 0) {
    return null;
  }

  const m = numerator / denominator;
  const c = (sumY - m * sumX) / n;

  return { m, c };
}

export function calculateRegressionStats(data: DataValue[]): RegressionStats {
  const regression = linearRegression(data, data);
  const m = regression?.m ?? 0;
  const c = regression?.c ?? 0;
  const mr = getMovements(data).map((d) => d.value);
  const avgMR = mr.length > 0 ? average(mr) : 0;
  return {
    m,
    c,
    avgMR,
  };
}

export function createTrendlines(
  { m, c, avgMR }: RegressionStats,
  dataValues: DataValue[]
) {
  let centreLine: DataValue[] = [];
  let unpl: DataValue[] = [];
  let lnpl: DataValue[] = [];
  let lowerQtl: DataValue[] = [];
  let upperQtl: DataValue[] = [];
  let reducedUnpl: DataValue[] = [];
  let reducedLnpl: DataValue[] = [];

  dataValues.forEach((d, i) => {
    const centreLineValue = i * m + c;
    const unplValue = centreLineValue + avgMR * NPL_SCALING;
    const lnplValue = centreLineValue - avgMR * NPL_SCALING;
    const lowerQtlValue = (lnplValue + centreLineValue) / 2;
    const upperQtlValue = (unplValue + centreLineValue) / 2;

    const reducedUnplValue = centreLineValue + (avgMR - m) * NPL_SCALING;
    const reducedLnplValue = centreLineValue - (avgMR - m) * NPL_SCALING;

    const createDataValue = (value: number) => ({
      order: i,
      x: d.x,
      value: round(value),
      status: DataStatus.NORMAL,
    });

    centreLine.push(createDataValue(centreLineValue));
    unpl.push(createDataValue(unplValue));
    lnpl.push(createDataValue(lnplValue));
    lowerQtl.push(createDataValue(lowerQtlValue));
    upperQtl.push(createDataValue(upperQtlValue));

    reducedUnpl.push(createDataValue(reducedUnplValue));
    reducedLnpl.push(createDataValue(reducedLnplValue));
  });

  return {
    centreLine,
    unpl,
    lnpl,
    lowerQtl,
    upperQtl,
    reducedUnpl,
    reducedLnpl,
  };
}

export function csvTestingParser(str: string, delimiter = ",") {
  let xLabel = "";
  let yLabel = "";
  let multiplier = 0;
  const xdata: DataValue[] = [];

  const firstBreak = str.indexOf("\r\n");

  if (firstBreak == -1) {
    return { passed: false, multiplier, xLabel, yLabel, xdata, error: "Missing CSV labels and/or data." };
  }
  const labels = str.slice(0, firstBreak).split(delimiter);
  if (labels.length < 2) {
    return { passed: false, multiplier, xLabel, yLabel, xdata, error: "First row of CSV must have 2 columns." };
  } else if (labels[0] === "" || labels[1] === "") {
    return { passed: false, multiplier, xLabel, yLabel, xdata, error: "Missing CSV label(s)." };
  } else if (labels[0].toLowerCase() != "date") {
    return { passed: false, multiplier, xLabel, yLabel, xdata, error: "First column of CSV must be 'Date'." };
  }
  xLabel = "Date";
  yLabel = labels[1];

  const rows = str.slice(firstBreak + 2).split("\r\n");
  if (rows.length == 0) {
    return { passed: false, multiplier, xLabel, yLabel, xdata, error: "Missing CSV data." };
  }
  for (let i = 0; i < rows.length; i++) {
    const values = rows[i].split(delimiter);
    if (values[0] === "" || values[1] === "") {
      const remainingContent = rows.slice(i + 1).join(delimiter);
      if (remainingContent.replace(/,/g, "") !== "") {
        return { passed: false, multiplier: 0, xLabel, yLabel, xdata, error: "Fragmented CSV data." };
      } else {
        return { passed: true, multiplier, xLabel, yLabel, xdata };
      }
    }
    const parsedDate = Date.parse(values[0]);
    if (!parsedDate) {
      return { passed: false, multiplier, xLabel, yLabel, xdata, error: "Please input date in YYYY-MM-DD format." };
    }
    let parsedVal = Number(values[1]);
    if (isNaN(parsedVal)) {
      return { passed: false, multiplier, xLabel, yLabel, xdata, error: "Values must be numbers." };
    } else {
      while (Math.abs(parsedVal) / 10 ** multiplier >= 10000) {
        multiplier += 3;
      }
      xdata.push({
        order: i,
        x: values[0],
        value: parsedVal,
        status: DataStatus.NORMAL,
      });
    }
  }
  return { passed: true, multiplier, xLabel, yLabel, xdata };
}
