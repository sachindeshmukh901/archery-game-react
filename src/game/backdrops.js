import { W, H, GROUND, rnd } from './constants.js';

function forestBg(c) {
  let g = c.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#7fbfb6');
  g.addColorStop(0.6, '#cde8d3');
  g.addColorStop(1, '#f1f5d8');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  const sg = c.createRadialGradient(540, 340, 10, 540, 340, 300);
  sg.addColorStop(0, 'rgba(255,246,200,.95)');
  sg.addColorStop(0.3, 'rgba(255,246,200,.5)');
  sg.addColorStop(1, 'rgba(255,246,200,0)');
  c.fillStyle = sg;
  c.fillRect(0, 0, W, H);
  c.fillStyle = '#fff6cf';
  c.beginPath();
  c.arc(540, 340, 50, 0, 7);
  c.fill();

  c.fillStyle = '#93c3a8';
  c.beginPath();
  c.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) c.lineTo(x, 400 + Math.sin(x * 0.006 + 1) * 34 + Math.sin(x * 0.017) * 10);
  c.lineTo(W, H);
  c.fill();

  c.fillStyle = '#62a07f';
  c.beginPath();
  c.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) c.lineTo(x, 455 + Math.sin(x * 0.005 + 3) * 26 + Math.sin(x * 0.02 + 1) * 8);
  c.lineTo(W, H);
  c.fill();

  const mg = c.createLinearGradient(0, 420, 0, 500);
  mg.addColorStop(0, 'rgba(255,255,255,0)');
  mg.addColorStop(0.5, 'rgba(255,255,255,.35)');
  mg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = mg;
  c.fillRect(0, 420, W, 80);

  for (let i = 0, x = -10; x < W + 20; i++, x += 30 + rnd(i) * 14) {
    const h = 70 + rnd(i * 3) * 70;
    const w = 26 + rnd(i * 5) * 12;
    const base = 505;
    c.fillStyle = rnd(i * 7) > 0.5 ? '#2b6048' : '#337352';
    for (let t = 0; t < 3; t++) {
      const top = base - h + t * (h * 0.26);
      const bot = base - h * 0.55 + t * (h * 0.28);
      const ww = w * (0.55 + t * 0.25);
      c.beginPath();
      c.moveTo(x, top);
      c.lineTo(x + ww, bot);
      c.lineTo(x - ww, bot);
      c.closePath();
      c.fill();
    }
    c.fillStyle = '#3b2a18';
    c.fillRect(x - 2, base - 6, 4, 12);
  }

  g = c.createLinearGradient(0, 500, 0, H);
  g.addColorStop(0, '#4f9157');
  g.addColorStop(1, '#2a5a3a');
  c.fillStyle = g;
  c.fillRect(0, 500, W, H - 500);
  c.fillStyle = 'rgba(255,255,255,.07)';
  for (let i = 0; i < 9; i++) c.fillRect(i * 120 - 20, 500, 60, H - 500);
}

function deadTree(c, x, y, len, ang, depth, w, seed) {
  if (depth === 0 || len < 6) return;
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  c.lineWidth = Math.max(1, w);
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x2, y2);
  c.stroke();
  deadTree(c, x2, y2, len * (0.7 + rnd(seed + 1) * 0.12), ang - 0.3 - rnd(seed + 2) * 0.4, depth - 1, w * 0.7, seed * 2 + 1);
  deadTree(c, x2, y2, len * (0.68 + rnd(seed + 3) * 0.12), ang + 0.3 + rnd(seed + 4) * 0.4, depth - 1, w * 0.7, seed * 2 + 2);
  if (depth > 4 && rnd(seed + 5) > 0.5) {
    deadTree(c, x2, y2, len * 0.5, ang + (rnd(seed + 6) - 0.5) * 1.4, depth - 2, w * 0.5, seed * 3 + 7);
  }
}

function horrorBg(c) {
  let g = c.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#020102');
  g.addColorStop(0.55, '#160509');
  g.addColorStop(1, '#3d0a12');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  for (let i = 0; i < 60; i++) {
    c.fillStyle = 'rgba(255,230,230,' + (0.15 + rnd(i * 2) * 0.5) + ')';
    c.fillRect(rnd(i) * W, rnd(i * 9) * 300, 1.5, 1.5);
  }

  // blood moon
  const mx = 300;
  const my = 150;
  let mg = c.createRadialGradient(mx, my, 40, mx, my, 330);
  mg.addColorStop(0, 'rgba(210,30,30,.5)');
  mg.addColorStop(1, 'rgba(210,30,30,0)');
  c.fillStyle = mg;
  c.fillRect(0, 0, W, 480);
  mg = c.createRadialGradient(mx - 20, my - 20, 8, mx, my, 76);
  mg.addColorStop(0, '#e8745a');
  mg.addColorStop(0.7, '#b52a22');
  mg.addColorStop(1, '#6e0c10');
  c.fillStyle = mg;
  c.beginPath();
  c.arc(mx, my, 76, 0, 7);
  c.fill();
  c.fillStyle = 'rgba(60,5,8,.28)';
  [[-24, -10, 14], [18, 22, 18], [-6, 34, 9], [30, -24, 10]].forEach((k) => {
    c.beginPath();
    c.arc(mx + k[0], my + k[1], k[2], 0, 7);
    c.fill();
  });
  c.fillStyle = 'rgba(8,2,4,.65)';
  c.beginPath();
  c.ellipse(mx + 10, my - 14, 110, 5, -0.05, 0, 7);
  c.fill();
  c.beginPath();
  c.ellipse(mx - 20, my + 28, 90, 4, 0.04, 0, 7);
  c.fill();

  // far hills
  c.fillStyle = '#14050a';
  c.beginPath();
  c.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) c.lineTo(x, 430 + Math.sin(x * 0.006 + 2) * 30 + Math.sin(x * 0.019) * 9);
  c.lineTo(W, H);
  c.fill();

  // dead trees
  c.strokeStyle = '#030103';
  c.lineCap = 'round';
  deadTree(c, 42, 540, 92, -1.5, 8, 11, 1);
  deadTree(c, 520, 532, 78, -1.62, 8, 9, 3);
  deadTree(c, 985, 540, 90, -1.7, 8, 11, 5);

  // graveyard
  c.fillStyle = '#0a0308';
  c.strokeStyle = 'rgba(170,35,35,.3)';
  c.lineWidth = 1.5;
  [
    [215, 'stone', 30, 44], [262, 'cross', 26, 56], [340, 'stone', 34, 36], [392, 'stone', 28, 50],
    [610, 'cross', 28, 60], [668, 'stone', 32, 40], [716, 'stone', 26, 52],
  ].forEach(([x, kind, w, h]) => {
    const base = 538;
    c.beginPath();
    if (kind === 'stone') {
      c.moveTo(x - w / 2, base);
      c.lineTo(x - w / 2, base - h + w / 2);
      c.arc(x, base - h + w / 2, w / 2, Math.PI, 0);
      c.lineTo(x + w / 2, base);
    } else {
      c.rect(x - 4, base - h, 8, h);
      c.rect(x - w / 2, base - h * 0.72, w, 8);
    }
    c.closePath();
    c.fill();
    c.stroke();
  });

  // ground
  g = c.createLinearGradient(0, 520, 0, H);
  g.addColorStop(0, '#0d0407');
  g.addColorStop(1, '#030102');
  c.fillStyle = g;
  c.fillRect(0, 520, W, H - 520);
  g = c.createLinearGradient(0, 470, 0, GROUND);
  g.addColorStop(0, 'rgba(150,10,18,0)');
  g.addColorStop(1, 'rgba(150,10,18,.3)');
  c.fillStyle = g;
  c.fillRect(0, 470, W, GROUND - 470);
  c.strokeStyle = '#050204';
  c.lineWidth = 2;
  for (let i = 0; i < 90; i++) {
    const x = rnd(i * 11) * W;
    const y = 538 + rnd(i * 13) * 20;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + (rnd(i) - 0.5) * 8, y - 8 - rnd(i * 3) * 10);
    c.stroke();
  }
}

const cache = {};

// Scenery is painted once per theme into an offscreen canvas, then reused every frame.
export function getBackdrop(name) {
  if (!cache[name]) {
    const o = document.createElement('canvas');
    o.width = W;
    o.height = H;
    (name === 'forest' ? forestBg : horrorBg)(o.getContext('2d'));
    cache[name] = o;
  }
  return cache[name];
}
