import { W, H, rnd, clamp } from './constants.js';

// ---- Fog (pre-rendered tileable texture that drifts sideways) ----
let fogTex = null;
function makeFog() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = 150;
  const x = c.getContext('2d');
  for (let i = 0; i < 14; i++) {
    const bx = rnd(i * 3) * W;
    const by = 50 + rnd(i * 5) * 50;
    const r = 80 + rnd(i * 7) * 90;
    [-W, 0, W].forEach((off) => {
      x.save();
      x.translate(bx + off, by);
      x.scale(1, 0.45);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, 'rgba(215,200,200,.5)');
      g.addColorStop(1, 'rgba(215,200,200,0)');
      x.fillStyle = g;
      x.fillRect(-r, -r, r * 2, r * 2);
      x.restore();
    });
  }
  return c;
}

export function drawFog(ctx, y, alpha, speed, t, reduce) {
  if (!fogTex) fogTex = makeFog();
  const off = ((((t / 1000) * speed * (reduce ? 0.2 : 1)) % W) + W) % W;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(fogTex, off - W, y);
  ctx.drawImage(fogTex, off, y);
  ctx.restore();
}

// ---- Film grain ----
let grainPat = null;
function makeGrain(ctx) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const x = c.getContext('2d');
  const d = x.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  return ctx.createPattern(c, 'repeat');
}

// ---- Crows ----
const crows = [
  { x: 100, y: 90, s: 46, p: 0 },
  { x: 640, y: 60, s: 60, p: 2 },
  { x: 880, y: 135, s: 38, p: 4 },
];

export function drawCrows(ctx, t, dt, reduce) {
  ctx.save();
  ctx.strokeStyle = '#020102';
  ctx.fillStyle = '#020102';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  crows.forEach((c) => {
    c.x += c.s * dt * (reduce ? 0.3 : 1);
    if (c.x > W + 30) c.x = -30;
    const y = c.y + Math.sin(t / 900 + c.p) * 10;
    const f = Math.sin(t / 110 + c.p) * (reduce ? 2 : 6);
    ctx.beginPath();
    ctx.moveTo(c.x - 14, y - f);
    ctx.quadraticCurveTo(c.x - 6, y - 4 - f * 0.2, c.x, y);
    ctx.quadraticCurveTo(c.x + 6, y - 4 - f * 0.2, c.x + 14, y - f);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(c.x, y + 1, 4, 2.5, 0, 0, 7);
    ctx.fill();
  });
  ctx.restore();
}

// ---- Lightning ----
export function makeBolt() {
  const pts = [];
  let x = 120 + Math.random() * 760;
  for (let y = 0; y <= 330; y += 30) {
    pts.push([x, y]);
    x += (Math.random() - 0.5) * 60;
  }
  return pts;
}

export function drawBolt(ctx, flash, bolt) {
  if (!(flash > 0 && bolt)) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,240,240,' + clamp(flash * 1.4, 0, 1) + ')';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ff6060';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  bolt.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  ctx.restore();
}

// Screen-space overlays: lightning flash, flickering vignette, heartbeat tint, grain.
export function drawHorrorOverlays(ctx, game, t) {
  const { flash, power, state, reduce } = game;
  if (flash > 0) {
    ctx.fillStyle = 'rgba(255,215,215,' + flash * 0.26 * (0.6 + 0.4 * Math.sin(t / 22)) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.save();
  ctx.globalAlpha = reduce ? 0.95 : 0.88 + 0.12 * Math.sin(t / 130) * Math.sin(t / 37);
  const vg = ctx.createRadialGradient(W / 2, H / 2, 190, W / 2, H / 2, 640);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.82)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  if (state === 'charging' && power > 0.05) {
    const beat = reduce ? 0.7 : 0.5 + 0.5 * Math.sin(t / (190 - power * 80));
    const rg = ctx.createRadialGradient(W / 2, H / 2, 160, W / 2, H / 2, 620);
    rg.addColorStop(0, 'rgba(120,0,0,0)');
    rg.addColorStop(1, 'rgba(150,0,8,' + 0.5 * power * (0.5 + 0.5 * beat) + ')');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  if (!reduce) {
    if (!grainPat) grainPat = makeGrain(ctx);
    ctx.save();
    ctx.translate(-((Math.random() * 128) | 0), -((Math.random() * 128) | 0));
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = grainPat;
    ctx.fillRect(0, 0, W + 128, H + 128);
    ctx.restore();
  }
}
