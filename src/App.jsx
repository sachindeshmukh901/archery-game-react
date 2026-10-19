import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcheryGame } from './game/engine.js';
import { W, H, TOTAL } from './game/constants.js';
import { load, save } from './storage.js';
import Header from './components/Header.jsx';
import StartOverlay from './components/StartOverlay.jsx';
import EndOverlay from './components/EndOverlay.jsx';
import ControlsBar from './components/ControlsBar.jsx';

const SKINS = ['horror', 'forest'];
const MODES = ['simple', 'hard'];

export default function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  const [skin, setSkin] = useState(() => {
    const v = load('archery_skin3', 'horror');
    return SKINS.includes(v) ? v : 'horror';
  });
  const [mode, setMode] = useState(() => {
    const v = load('archery_mode', 'simple');
    return MODES.includes(v) ? v : 'simple';
  });
  const [bests, setBests] = useState(() => ({
    simple: parseInt(load('archery_best_simple', '0'), 10) || 0,
    hard: parseInt(load('archery_best_hard', '0'), 10) || 0,
  }));
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [hud, setHud] = useState({ score: 0, arrowsLeft: TOTAL });
  const [result, setResult] = useState(null);

  // Create the engine once. It is torn down on unmount (also handles React StrictMode).
  useEffect(() => {
    const game = new ArcheryGame(canvasRef.current, {
      onChange: setHud,
      onEnd: (res) => {
        setResult(res);
        setPhase('done');
        setBests((prev) => {
          if (res.score <= prev[res.mode]) return prev;
          save('archery_best_' + res.mode, res.score);
          return { ...prev, [res.mode]: res.score };
        });
      },
    });
    gameRef.current = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  // Keep engine and page in sync with the chosen theme and mode.
  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    gameRef.current?.setSkin(skin);
    save('archery_skin3', skin);
  }, [skin]);

  useEffect(() => {
    gameRef.current?.setMode(mode);
    save('archery_mode', mode);
  }, [mode]);

  const startRound = useCallback((m) => {
    setMode(m);
    const game = gameRef.current;
    game.setMode(m);
    game.start();
    setResult(null);
    setPhase('playing');
  }, []);

  const changeMode = (m) => {
    if (m === mode) return;
    if (phase === 'idle') setMode(m);
    else startRound(m); // switching mid-game starts a fresh round in the new mode
  };

  return (
    <div className="app">
      <Header mode={mode} best={bests[mode]} score={hud.score} />

      <div className="stage">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          tabIndex={0}
          aria-label="Archery range. Move the pointer up or down to set the angle, hold to draw the bow, release to shoot."
        />
        {phase === 'idle' && <StartOverlay skin={skin} onStart={startRound} />}
        {phase === 'done' && result && (
          <EndOverlay
            result={result}
            best={bests[result.mode]}
            onAgain={() => startRound(result.mode)}
            onSwitch={() => startRound(result.mode === 'hard' ? 'simple' : 'hard')}
          />
        )}
      </div>

      <ControlsBar mode={mode} skin={skin} onMode={changeMode} onSkin={setSkin} />
    </div>
  );
}
