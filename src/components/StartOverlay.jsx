export default function StartOverlay({ skin, onStart }) {
  return (
    <div className="overlay">
      <div className="card">
        <h2>{skin === 'horror' ? 'Face the night' : 'Hit the rings'}</h2>
        <p>You have 5 arrows. Rings are worth 7, 8, 9 and 10 points.</p>
        <ul>
          <li><b>Move</b> the pointer up or down to tilt the bow (arrow keys also work).</li>
          <li><b>Hold</b> click or touch to draw the bow back. Space bar works too.</li>
          <li><b>Release</b> to shoot. Gravity pulls the arrow down, so aim a little high.</li>
          <li>
            <b>Simple mode:</b> the target stands still. <b>Hard mode:</b> it slides and bobs, so lead your shot.
          </li>
        </ul>
        <div className="btns">
          <button onClick={() => onStart('simple')}>Simple mode</button>
          <button className="alt" onClick={() => onStart('hard')}>Hard mode</button>
        </div>
      </div>
    </div>
  );
}
