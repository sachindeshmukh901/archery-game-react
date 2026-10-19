// Shared constants and tiny helpers for the archery engine.
export const W = 1200;
export const H = 560;
export const GROUND = 545;
export const S = { x: 152, y: 405 };   // archer's front shoulder
export const G = 1000;                 // gravity (px/s^2)
export const CHARGE_TIME = 1.4;        // seconds to a full draw
export const TOTAL = 5;                // arrows per round
export const MIN_ANG = -10;
export const MAX_ANG = 40;
export const EASY_POS = { x: 830, y: 290 };

// Rings listed outer -> inner. Points are scored by distance from the target centre.
export const RINGS = [
  { pts: 7, rx: 105, ry: 240 },
  { pts: 8, rx: 66, ry: 170 },
  { pts: 9, rx: 34, ry: 100 },
  { pts: 10, rx: 16, ry: 40 },
];

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rad = (d) => (d * Math.PI) / 180;
export const speedFor = (p) => 650 + 700 * p;
// Deterministic pseudo-random so cached scenery looks the same every time.
export const rnd = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
