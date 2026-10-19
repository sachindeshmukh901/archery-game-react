# Archery Game (React + Vite)

## 🚀 One-click launch

| | Link |
|---|---|
| **Play online** | `https://YOUR-USERNAME.github.io/archery-game-react/` |
| **Open in StackBlitz (runs in browser)** | `https://stackblitz.com/github/YOUR-USERNAME/archery-game-react` |

> Replace `YOUR-USERNAME` with your GitHub username.

A side-view archery game. A hooded hunter draws a bow and shoots at a target with four scoring rings (7, 8, 9, 10).

## Run it

```bash
npm install
npm run dev        # development server (http://localhost:5173)
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Requires Node 18 or newer.

## How to play

- Move the pointer up or down to tilt the bow (or use the Up / Down arrow keys).
- Hold click, touch or the space bar to draw the bow back. Release to shoot.
- Gravity pulls the arrow down, so aim a little high.
- You have 5 arrows per round. Maximum score is 50.
- **Simple mode:** the target stands still.
- **Hard mode:** the target slides along a rail and bobs up and down. Hit arrows ride along with it.
- Themes: **Horror** (blood moon, fog, lightning, film grain) and **Forest dawn**.
- Best scores are saved separately for each mode in localStorage.

## Project layout

```
src/
  main.jsx              entry point
  App.jsx               React state: theme, mode, round phase, best scores
  styles.css            theme tokens (CSS variables) and layout
  storage.js            safe localStorage helpers
  components/
    Header.jsx          title, best score, current score
    StartOverlay.jsx    intro card with Simple / Hard buttons
    EndOverlay.jsx      round result and rating
    ControlsBar.jsx     mode and theme switches
  game/
    engine.js           ArcheryGame class: loop, physics, input, scoring
    draw.js             canvas drawing (target, archer, arrows, HUD, particles)
    horrorFx.js         fog, crows, lightning, vignette, film grain
    backdrops.js        cached scenery for each theme
    palettes.js         colours for each theme
    constants.js        sizes, physics values, ring definitions
    audio.js            tiny synthesized sound effects
```

React renders the page UI. The game itself runs in a `<canvas>` driven by the `ArcheryGame` class, which talks to React through `onChange` and `onEnd` callbacks.

## Tweaking

- Ring sizes and points: `RINGS` in `src/game/constants.js`.
- Arrows per round: `TOTAL` in the same file.
- Hard-mode speed and range: `updateTarget()` in `src/game/engine.js`.
- Add a theme: add a palette in `palettes.js`, a backdrop in `backdrops.js`, CSS tokens in `styles.css`, and a button in `ControlsBar.jsx`.
