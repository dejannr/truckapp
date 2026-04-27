import { calculateDelta, calculatePctChange } from "@/lib/processing/calculators/utils/safeMath";

export function compareNumeric(current: number, previous: number) {
  return {
    selected: current,
    compared: previous,
    delta: calculateDelta(current, previous),
    pctChange: calculatePctChange(current, previous),
  };
}
