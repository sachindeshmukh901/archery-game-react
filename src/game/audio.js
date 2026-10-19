let audio = null;

export function hasAudio() {
  return !!audio;
}

export function beep(freq, dur, type = 'sine', vol = 0.06, slideTo) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audio.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, audio.currentTime + dur);
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + dur);
  } catch (e) {
    /* audio is optional */
  }
}
