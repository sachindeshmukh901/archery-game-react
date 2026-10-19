import {
  W, H, GROUND, S, G, CHARGE_TIME, TOTAL, RINGS, MIN_ANG, MAX_ANG, EASY_POS,
  clamp, rad, speedFor,
} from './constants.js';
import { beep, hasAudio } from './audio.js';
import { getPalette } from './palettes.js';
import { getBackdrop } from './backdrops.js';
import * as fx from './horrorFx.js';
import * as draw from './draw.js';

/**
 * Canvas game engine. It owns the animation loop, physics and input.
 * React only talks to it through a few methods and two callbacks:
 *   onChange({ score, arrowsLeft })  - fired whenever the score or ammo changes
 *   onEnd({ score, shots, mode, skin }) - fired shortly after the last arrow lands
 */
export class ArcheryGame {
  constructor(canvas, { onChange, onEnd }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onChange = onChange || (() => {});
    this.onEnd = onEnd || (() => {});
    this.reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    this.state = 'idle'; // idle | ready | charging | flying | done
    this.mode = 'simple';
    this.skin = 'horror';
    this.angleDeg = 12;
    this.power = 0;
    this.chargeStart = 0;
    this.arrowsLeft = TOTAL;
    this.score = 0;
    this.shots = [];
    this.flight = null;
    this.stuck = [];
    this.popups = [];
    this.parts = [];
    this.tx = EASY_POS.x;
    this.ty = EASY_POS.y;
    this.moveClock = 0;
    this.movePhase = 0;
    this.shake = 0;
    this.flash = 0;
    this.bolt = null;
    this.nextFlash = performance.now() + 4500;
    this.lastBeat = 0;
    this.endTimer = null;
    this.last = performance.now();

    this.frame = this.frame.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.endTimer);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  // ---- Public API ----
  setSkin(skin) {
    this.skin = skin;
  }

  setMode(mode) {
    this.mode = mode;
    this.moveClock = 0;
    this.movePhase = Math.random() * Math.PI * 2;
    this.updateTarget(0);
  }

  start() {
    clearTimeout(this.endTimer);
    this.arrowsLeft = TOTAL;
    this.score = 0;
    this.shots = [];
    this.stuck = [];
    this.popups = [];
    this.parts = [];
    this.flight = null;
    this.power = 0;
    this.moveClock = 0;
    this.movePhase = Math.random() * Math.PI * 2;
    this.state = 'ready';
    this.emit();
    this.canvas.focus({ preventScroll: true });
  }

  emit() {
    this.onChange({ score: this.score, arrowsLeft: this.arrowsLeft });
  }

  // ---- Geometry ----
  geom() {
    const a = rad(this.angleDeg);
    const dx = Math.cos(a);
    const dy = -Math.sin(a);
    const pull = this.state === 'charging' ? this.power : 0;
    const back = 8 + 46 * pull;
    const grip = { x: S.x + dx * 62, y: S.y + dy * 62 };
    return {
      dx, dy, pull, G: grip,
      N: { x: grip.x - dx * back, y: grip.y - dy * back }, // string hand
      tip: { x: S.x + dx * 105, y: S.y + dy * 105 },       // arrow head
    };
  }

  // Hard mode: the target slides left/right and bobs up/down. Simple mode: it stays put.
  updateTarget(dt) {
    if (this.mode === 'hard') {
      if (this.state !== 'idle') this.moveClock += dt;
      this.tx = 765 + 115 * Math.sin((this.moveClock * 2 * Math.PI) / 7 + this.movePhase);
      this.ty = 288 + 16 * Math.sin((this.moveClock * 2 * Math.PI) / 4.3 + 1);
    } else {
      this.tx = EASY_POS.x;
      this.ty = EASY_POS.y;
    }
  }

  pointsAt(y) {
    const d = Math.abs(y - this.ty);
    for (let i = RINGS.length - 1; i >= 0; i--) if (d <= RINGS[i].ry) return RINGS[i].pts;
    return 0;
  }

  // ---- Shooting ----
  beginCharge(t) {
    if (this.state !== 'ready') return;
    this.state = 'charging';
    this.chargeStart = t;
    this.power = 0;
    this.lastBeat = 0;
    beep(200, 0.15, 'triangle', 0.03, 320);
  }

  release() {
    if (this.state !== 'charging') return;
    if (this.power < 0.12) {
      this.state = 'ready';
      this.power = 0;
      return;
    }
    const g = this.geom();
    const v = speedFor(this.power);
    this.flight = { x: g.tip.x, y: g.tip.y, vx: g.dx * v, vy: g.dy * v, passed: false };
    this.power = 0;
    this.state = 'flying';
    beep(480, 0.2, 'sawtooth', 0.04, 150);
  }

  spawn(x, y, n, kind) {
    for (let i = 0; i < n; i++) {
      const ang = kind === 'dust' ? -Math.PI / 2 + (Math.random() - 0.5) * 2 : Math.PI + (Math.random() - 0.5) * 2.6;
      const sp = 70 + Math.random() * 320;
      this.parts.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 60,
        life: 0.6 + Math.random() * 0.7, r: 1.5 + Math.random() * 3, kind,
      });
    }
  }

  land(x, y, ang, pts, label, onTarget, hidden) {
    if (!hidden) {
      this.stuck.push({
        x, y, ox: x - this.tx, oy: y - this.ty, onTarget, ang,
        t0: performance.now(), seed: Math.floor(Math.random() * 1000),
      });
    }
    this.score += pts;
    this.arrowsLeft--;
    this.shots.push(pts);
    this.popups.push({ x: clamp(x, 80, W - 60), y: clamp(y - 24, 40, GROUND - 20), text: label, life: 1.4, pts });
    if (pts) {
      this.spawn(x, y, 10 + pts * 3, 'hit');
      if (!this.reduce) this.shake = 4 + pts * 0.6;
    } else if (!hidden) {
      this.spawn(x, y, 8, 'dust');
    }
    beep(pts ? (this.skin === 'horror' ? 90 + pts * 8 : 180 + pts * 22) : 110, 0.16, pts ? 'square' : 'sine', 0.05);
    this.flight = null;
    this.emit();
    if (this.arrowsLeft <= 0) {
      this.state = 'done';
      this.endTimer = setTimeout(() => {
        this.onEnd({ score: this.score, shots: this.shots.slice(), mode: this.mode, skin: this.skin });
      }, 1100);
    } else {
      this.state = 'ready';
    }
  }

  stepFlight(dt) {
    const f = this.flight;
    if (!f) return;
    const px = f.x;
    const py = f.y;
    f.vy += G * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    const ang = Math.atan2(f.vy, f.vx);

    if (!f.passed && f.x >= this.tx) {            // reached the target plane
      const k = clamp((this.tx - px) / (f.x - px || 1), 0, 1);
      const y = py + k * (f.y - py);
      const pts = this.pointsAt(y);
      if (pts > 0) {
        this.land(this.tx, y, ang, pts, '+' + pts, true);
        return;
      }
      f.passed = true;                            // flew past the rings, keep going
    }
    if (f.y >= GROUND) {
      this.land(f.x, GROUND, ang, 0, 'Miss', false);
    } else if (f.x > W + 40) {
      this.land(W - 10, clamp(f.y, 60, GROUND), ang, 0, 'Miss', false, true);
    }
  }

  // ---- Input ----
  pointerPos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }

aimTo(p) {
  const dx = Math.max(60, p.x - S.x);
  const dy = S.y - p.y;

  this.angleDeg = clamp(
    (Math.atan2(dy, dx) * 180) / Math.PI,
    MIN_ANG,
    MAX_ANG
  );
}

  onPointerMove(e) {
    if (this.state === 'ready' || this.state === 'charging') this.aimTo(this.pointerPos(e));
  }

  onPointerDown(e) {
    this.canvas.setPointerCapture(e.pointerId);
    if (this.state === 'ready') this.aimTo(this.pointerPos(e));
    this.beginCharge(performance.now());
  }

  onPointerUp() {
    this.release();
  }

  onPointerCancel() {
    if (this.state === 'charging') {
      this.state = 'ready';
      this.power = 0;
    }
  }

  onKeyDown(e) {
    if (document.activeElement !== this.canvas) return;
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      this.beginCharge(performance.now());
    }
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      this.angleDeg = clamp(this.angleDeg + 1, MIN_ANG, MAX_ANG);
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      this.angleDeg = clamp(this.angleDeg - 1, MIN_ANG, MAX_ANG);
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space') this.release();
  }

  // ---- Animation loop ----
  frame(t) {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;

    if (this.state === 'charging') this.power = clamp((t - this.chargeStart) / 1000 / CHARGE_TIME, 0, 1);
    this.updateTarget(dt);
    if (this.state === 'flying') {
      for (let i = 0; i < 8 && this.flight; i++) this.stepFlight(dt / 8);
    }
    this.shake = Math.max(0, this.shake - 30 * dt);

    const horror = this.skin === 'horror';
    if (horror && !this.reduce) {
      if (t > this.nextFlash) {
        this.flash = 1;
        this.bolt = fx.makeBolt();
        this.nextFlash = t + 6000 + Math.random() * 9000;
        if (hasAudio()) setTimeout(() => beep(55, 1.1, 'sawtooth', 0.05, 28), 260);
      }
      this.flash = Math.max(0, this.flash - dt * 1.8);
      if (this.state === 'charging' && hasAudio() && t - this.lastBeat > 720 - this.power * 420) {
        this.lastBeat = t;
        beep(52, 0.18, 'sine', 0.14, 38);
        setTimeout(() => beep(48, 0.14, 'sine', 0.1, 36), 150);
      }
    }

    this.render(t, dt, horror);
    this.raf = requestAnimationFrame(this.frame);
  }

  render(t, dt, horror) {
    const ctx = this.ctx;
    const P = getPalette(this.skin);
    const g = this.geom();

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (horror && this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake * 2, (Math.random() - 0.5) * this.shake * 2);
    }

    ctx.drawImage(getBackdrop(this.skin), 0, 0);
    if (horror) {
      fx.drawBolt(ctx, this.flash, this.bolt);
      fx.drawCrows(ctx, t, dt, this.reduce);
      fx.drawFog(ctx, 405, 0.5, 7, t, this.reduce);
    }
    draw.drawGround(ctx, P);
    draw.drawTarget(ctx, P, this);
    draw.drawStuck(ctx, P, this, t);
    draw.drawArcher(ctx, P, this, g, t);
    if (this.state !== 'idle') draw.drawPreview(ctx, P, this, g);
    if (this.state === 'flying' && this.flight) {
      const f = this.flight;
      draw.drawArrowShape(ctx, P, f.x, f.y, Math.atan2(f.vy, f.vx), 95);
    }
    if (horror) fx.drawFog(ctx, 462, 0.4, -12, t, this.reduce);
    draw.drawParts(ctx, P, this, dt);
    draw.drawReadout(ctx, P, this);
    draw.drawPopups(ctx, P, this, dt);
    ctx.restore();

    if (horror) fx.drawHorrorOverlays(ctx, this, t);
  }
}
