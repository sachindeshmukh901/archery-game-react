export default function Header({ mode, best, score }) {
  return (
    <header className="header">
      <div className="best">
        {mode === 'hard' ? 'Hard' : 'Simple'} best - <span>{best}</span>
      </div>
      <h1>Archery Game</h1>
      <div className="score" aria-live="polite">
        Your score - <span>{score}</span>
      </div>
    </header>
  );
}
