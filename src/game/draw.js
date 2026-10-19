import { W, GROUND, S, RINGS, TOTAL, G, clamp, rnd, speedFor } from './constants.js';

function glow(ctx, P, color, blur = 14) {
  if (P.glow) {
    ctx.shadowColor = P.glowColor || color;
    ctx.shadowBlur = blur;
  }
}
function noGlow(ctx) {
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawGround(ctx, P) {
  ctx.save();
  ctx.strokeStyle = P.groundLine;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  ctx.lineTo(W, GROUND);
  ctx.stroke();
  ctx.restore();
}

export function drawTarget(ctx, P, game) {
  const { tx, ty, mode } = game;
  ctx.save();
  // Rail and cart in Hard mode so the movement makes sense
  if (mode === 'hard') {
    ctx.strokeStyle = P.rail;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(520, GROUND - 3);
    ctx.lineTo(W, GROUND - 3);
    ctx.stroke();
    ctx.fillStyle = P.leg;
    rrect(ctx, tx - 30, GROUND - 18, 60, 12, 3);
    ctx.fill();
    ctx.fillStyle = P.groundLine;
    ctx.beginPath();
    ctx.arc(tx - 18, GROUND - 6, 6, 0, 7);
    ctx.arc(tx + 18, GROUND - 6, 6, 0, 7);
    ctx.fill();
  }
  ctx.strokeStyle = P.leg;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tx, ty + 238);
  ctx.lineTo(tx, mode === 'hard' ? GROUND - 14 : GROUND);
  ctx.stroke();

  RINGS.forEach((r, i) => {
    ctx.beginPath();
    ctx.ellipse(tx, ty, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.ringFill[i];
    ctx.fill();
    ctx.strokeStyle = P.ringStroke;
    ctx.lineWidth = 4;
    glow(ctx, P, P.ringStroke, 16);
    ctx.stroke();
    noGlow(ctx);
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 24px ' + P.font;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = P.ringLabel[i];
    ctx.fillText(String(RINGS[i].pts), tx, ty - (RINGS[i].ry + RINGS[i + 1].ry) / 2);
  }
  ctx.font = '800 15px ' + P.font;
  ctx.fillStyle = P.ringLabel[3];
  ctx.fillText('10', tx, ty);
  ctx.restore();
}

export function drawArrowShape(ctx, P, x, y, ang, len) {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const nx = -dy;
  const ny = dx;
  const tx2 = x - dx * len;
  const ty2 = y - dy * len;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = P.shaft;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(tx2, ty2);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = P.head;
  ctx.beginPath();
  ctx.moveTo(x + dx * 8, y + dy * 8);
  ctx.lineTo(x - dx * 8 + nx * 6, y - dy * 8 + ny * 6);
  ctx.lineTo(x - dx * 8 - nx * 6, y - dy * 8 - ny * 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = P.fletch;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tx2 + dx * 18, ty2 + dy * 18);
  ctx.lineTo(tx2 + nx * 9, ty2 + ny * 9);
  ctx.moveTo(tx2 + dx * 18, ty2 + dy * 18);
  ctx.lineTo(tx2 - nx * 9, ty2 - ny * 9);
  ctx.moveTo(tx2 + dx * 8, ty2 + dy * 8);
  ctx.lineTo(tx2 - dx * 4 + nx * 9, ty2 - dy * 4 + ny * 9);
  ctx.moveTo(tx2 + dx * 8, ty2 + dy * 8);
  ctx.lineTo(tx2 - dx * 4 - nx * 9, ty2 - dy * 4 - ny * 9);
  ctx.stroke();
  ctx.restore();
}

export function drawStuck(ctx, P, game, t) {
  const { tx, ty } = game;
  game.stuck.forEach((s) => {
    // Arrows that hit the target ride along with it
    const x = s.onTarget ? tx + s.ox : s.x;
    const y = s.onTarget ? ty + s.oy : s.y;
    if (P.blood && s.onTarget) {
      const k = clamp((t - s.t0) / 1600, 0, 1);
      ctx.save();
      ctx.fillStyle = 'rgba(150,8,14,.92)';
      ctx.strokeStyle = 'rgba(150,8,14,.92)';
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 6 + rnd(s.seed) * 5, 0, 7);
      ctx.fill();
      for (let d = 0; d < 3; d++) {
        const ox = (rnd(s.seed + d + 1) - 0.5) * 16;
        const len = (14 + rnd(s.seed + d + 7) * 34) * k;
        ctx.beginPath();
        ctx.moveTo(x + ox, y);
        ctx.lineTo(x + ox, y + len);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + ox, y + len, 2.6, 0, 7);
        ctx.fill();
      }
      ctx.restore();
    }
    drawArrowShape(ctx, P, x, y, s.ang, 95);
  });
}

export function drawArcher(ctx, P, game, g, t) {
  const { reduce, state } = game;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.ellipse(S.x + 2, GROUND - 2, 36, 6, 0, 0, 7);
  ctx.fill();

  const sway = reduce || !P.hood ? 0 : Math.sin(t / 420) * 4;
  const elbow = { x: (S.x + g.N.x) / 2, y: (S.y + g.N.y) / 2 + 16 };

  const body = (color, ex) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    // legs
    ctx.lineWidth = 12 + ex;
    ctx.beginPath();
    ctx.moveTo(S.x - 2, 470);
    ctx.lineTo(S.x - 16, 538);
    ctx.moveTo(S.x + 2, 470);
    ctx.lineTo(S.x + 20, 538);
    ctx.stroke();
    ctx.lineWidth = ex + 1;
    if (P.hood) {
      // ragged cloak
      ctx.beginPath();
      ctx.moveTo(S.x + 14, S.y - 6);
      ctx.lineTo(S.x - 14, S.y - 8);
      ctx.lineTo(S.x - 50 + sway, S.y + 58);
      ctx.lineTo(S.x - 42 + sway, S.y + 72);
      ctx.lineTo(S.x - 34 + sway, S.y + 62);
      ctx.lineTo(S.x - 27 + sway, S.y + 76);
      ctx.lineTo(S.x - 18 + sway * 0.7, S.y + 64);
      ctx.lineTo(S.x - 10 + sway * 0.5, S.y + 78);
      ctx.lineTo(S.x + 2, S.y + 66);
      ctx.lineTo(S.x + 14, S.y + 74);
      ctx.lineTo(S.x + 19, S.y + 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // torso
    ctx.beginPath();
    ctx.moveTo(S.x - 16, S.y - 3);
    ctx.lineTo(S.x + 16, S.y - 3);
    ctx.lineTo(S.x + 18, 474);
    ctx.lineTo(S.x - 18, 474);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // head or hood
    if (P.hood) {
      ctx.beginPath();
      ctx.moveTo(S.x - 20, S.y - 6);
      ctx.lineTo(S.x - 22, S.y - 40);
      ctx.quadraticCurveTo(S.x - 12, S.y - 62, S.x + 6, S.y - 60);
      ctx.quadraticCurveTo(S.x + 24, S.y - 52, S.x + 22, S.y - 30);
      ctx.lineTo(S.x + 17, S.y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(S.x + 2, S.y - 28, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // quiver
    ctx.lineWidth = 10 + ex;
    ctx.beginPath();
    ctx.moveTo(S.x - 8, S.y - 2);
    ctx.lineTo(S.x - 26, S.y - 36);
    ctx.stroke();
    // arms
    ctx.lineWidth = 9 + ex;
    ctx.beginPath();
    ctx.moveTo(S.x, S.y + 2);
    ctx.lineTo(g.G.x, g.G.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(S.x, S.y + 2);
    ctx.lineTo(elbow.x, elbow.y);
    ctx.lineTo(g.N.x, g.N.y);
    ctx.stroke();
  };

  if (P.figureStroke) body(P.figureStroke, 6); // rim light
  body(P.figure, 0);

  // quiver arrow tails
  ctx.strokeStyle = P.fletch;
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(S.x - 26 + i * 3, S.y - 36);
    ctx.lineTo(S.x - 30 + i * 4, S.y - 48);
    ctx.stroke();
  }

  // hooded face void and glowing eyes
  if (P.hood) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(S.x + 9, S.y - 30, 10, 12, 0, 0, 7);
    ctx.fill();
    const fl = reduce ? 0.9 : 0.78 + 0.22 * Math.sin(t / 90) * Math.sin(t / 230);
    ctx.shadowColor = '#ff2020';
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(255,45,45,' + fl + ')';
    ctx.beginPath();
    ctx.ellipse(S.x + 13, S.y - 32, 3.3, 2, 0.2, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(S.x + 6, S.y - 32, 3, 2, -0.2, 0, 7);
    ctx.fill();
    noGlow(ctx);
  }

  // bow and string
  const px = -g.dy;
  const py = g.dx;
  const bowShift = 18;
  const T1 = { x: g.G.x + px * 58 + g.dx * bowShift - g.dy * 8, y: g.G.y + py * 58 - g.dy * 8 };
  const T2 = { x: g.G.x - px * 58 + g.dx * bowShift - g.dy * 8, y: g.G.y - py * 58 - g.dy * 8 };
  const C = { x: g.G.x + g.dx * 40 + g.dx * bowShift, y: g.G.y + g.dy * 40 };
  ctx.strokeStyle = P.bow;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(T1.x, T1.y);
  ctx.quadraticCurveTo(C.x, C.y, T2.x, T2.y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(T1.x, T1.y);
  ctx.quadraticCurveTo(C.x, C.y, T2.x, T2.y);
  ctx.stroke();
  ctx.strokeStyle = P.string;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(T1.x, T1.y);
  ctx.lineTo(g.N.x, g.N.y);
  ctx.lineTo(T2.x, T2.y);
  ctx.stroke();

  // nocked arrow
  if (state === 'ready' || state === 'charging') {
    drawArrowShape(ctx, P, g.tip.x, g.tip.y, Math.atan2(g.dy, g.dx), Math.hypot(g.tip.x - g.N.x, g.tip.y - g.N.y));
  }
  ctx.restore();
}

export function drawReadout(ctx, P, game) {
  const { arrowsLeft, power, state, angleDeg } = game;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = P.plate;
  rrect(ctx, 60, 206, 180, 92, 12);
  ctx.fill();
  for (let i = 0; i < TOTAL; i++) {
    const x = S.x - 4 + (i - (TOTAL - 1) / 2) * 24;
    ctx.beginPath();
    ctx.arc(x, 228, 7, 0, Math.PI * 2);
    if (i < arrowsLeft) {
      ctx.fillStyle = P.ink;
      ctx.fill();
    } else {
      ctx.strokeStyle = P.muted;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(128,128,128,.28)';
  rrect(ctx, 80, 246, 140, 12, 6);
  ctx.fill();
  if (power > 0) {
    ctx.fillStyle = power > 0.92 ? P.powerHot : P.powerFill;
    rrect(ctx, 80, 246, Math.max(12, 140 * power), 12, 6);
    ctx.fill();
  }
  ctx.strokeStyle = P.muted;
  ctx.lineWidth = 2;
  rrect(ctx, 80, 246, 140, 12, 6);
  ctx.stroke();
  ctx.fillStyle = P.muted;
  ctx.font = '600 15px ' + P.font;
  const pct = state === 'charging' ? Math.round(power * 100) : 0;
  ctx.fillText(Math.round(angleDeg) + '\u00b0 angle' + (pct ? '  \u00b7  ' + pct + '% power' : ''), S.x - 4, 288);
  ctx.restore();
}

// Short dotted hint of the arrow's first moments while you draw.
export function drawPreview(ctx, P, game, g) {
  if (game.state !== 'charging' || game.power < 0.12) return;
  const v = speedFor(game.power);
  const vx = g.dx * v;
  const vy = g.dy * v;
  ctx.save();
  ctx.fillStyle = P.ink;
  ctx.globalAlpha = 0.65;
  for (let t = 0.03; t < 0.26; t += 0.03) {
    ctx.beginPath();
    ctx.arc(g.tip.x + vx * t, g.tip.y + vy * t + 0.5 * G * t * t, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawParts(ctx, P, game, dt) {
  game.parts = game.parts.filter((p) => (p.life -= dt) > 0);
  game.parts.forEach((p) => {
    p.vy += 900 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    ctx.fillStyle = p.kind === 'dust' ? 'rgba(130,110,95,.8)' : P.part;
    ctx.globalAlpha = clamp(p.life * 2, 0, 1);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 7);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

export function drawPopups(ctx, P, game, dt) {
  game.popups = game.popups.filter((p) => (p.life -= dt) > 0);
  game.popups.forEach((p) => {
    const a = clamp(p.life, 0, 1);
    const y = p.y - (1.4 - p.life) * 30;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = '800 ' + (p.pts === 10 ? 40 : 32) + 'px ' + P.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = P.popStroke;
    ctx.strokeText(p.text, p.x - 70, y);
    ctx.fillStyle = p.pts ? P.accent : P.popMiss;
    glow(ctx, P, P.accent, 18);
    ctx.fillText(p.text, p.x - 70, y);
    ctx.restore();
  });
}
