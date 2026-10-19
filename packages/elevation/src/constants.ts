import { type ElevationSide } from "./types.js";

export const SIDE_TITLES: Record<ElevationSide, string> = {
  south: "南側立面図",
  north: "北側立面図",
  east: "東側立面図",
  west: "西側立面図",
};

export const FOUNDATION_HEIGHT_MM = 450;
export const DEFAULT_ROOF_OVERHANG_MM = 600;
export const DEFAULT_ROOF_PITCH = 4.0;
export const DEFAULT_SCALE = 100;

export type DefaultColors = {
  readonly wall: string;
  readonly roof: string;
  readonly frame: string;
  readonly glass: string;
  readonly line: string;
  readonly ground: string;
  readonly foundation: string;
};

export const DEFAULT_COLORS: DefaultColors = {
  wall: "#ffffff",
  roof: "#334155",
  frame: "#334155",
  glass: "#e0f2fe",
  line: "#0f172a",
  ground: "#475569",
  foundation: "#e2e8f0",
};

export const STROKE_WIDTHS = {
  heavy: 20,
  medium: 12,
  light: 6,
  mullion: 8,
} as const;

export const TEXT_SIZES = {
  title: 320,
  subtitle: 160,
  dimension: 150,
  level: 140,
} as const;

export const MARGINS = {
  left: 2000,
  right: 2800,
  top: 1400,
  bottom: 2200,
} as const;
