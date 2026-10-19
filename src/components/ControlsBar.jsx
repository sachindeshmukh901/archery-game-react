function Segmented({ label, value, options, onChange }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      <span>{label}</span>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ControlsBar({ mode, skin, onMode, onSkin }) {
  return (
    <div className="bar">
      <div className="hint">
        {mode === 'hard' ? 'Hard mode: the target moves. Lead your shot.' : 'Move to aim. Hold to draw. Release to shoot.'}
      </div>
      <div className="groups">
        <Segmented
          label="Mode"
          value={mode}
          onChange={onMode}
          options={[{ value: 'simple', label: 'Simple' }, { value: 'hard', label: 'Hard' }]}
        />
        <Segmented
          label="Theme"
          value={skin}
          onChange={onSkin}
          options={[{ value: 'horror', label: 'Horror' }, { value: 'forest', label: 'Forest dawn' }]}
        />
      </div>
    </div>
  );
}
