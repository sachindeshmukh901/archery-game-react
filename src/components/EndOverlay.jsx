const NAMES = {
  horror: ['Night Hunter', 'Grave Marksman', 'Shaky Hand', 'Easy Prey'],
  forest: ['Robin Hood', 'Sharpshooter', 'Steady hand', 'Keep practising'],
};

export function ratingFor(score, skin) {
  const n = NAMES[skin] || NAMES.forest;
  return score >= 42 ? n[0] : score >= 32 ? n[1] : score >= 20 ? n[2] : n[3];
}

export default function EndOverlay({ result, best, onAgain, onSwitch }) {
  const { score, shots, mode, skin } = result;
  const tens = shots.filter((s) => s === 10).length;
  const misses = shots.filter((s) => s === 0).length;
  return (
    <div className="overlay">
      <div className="card">
        <h2>{ratingFor(score, skin)}</h2>
        <div className="big">
          {score} <small>/ 50</small>
        </div>
        <p>
          {mode === 'hard' ? 'Hard' : 'Simple'} mode. {tens} bullseye{tens === 1 ? '' : 's'}, {misses} miss
          {misses === 1 ? '' : 'es'}. Best score: {best}.
        </p>
        <div className="btns">
          <button onClick={onAgain}>Play again</button>
          <button className="alt" onClick={onSwitch}>
            {mode === 'hard' ? 'Try simple mode' : 'Try hard mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
