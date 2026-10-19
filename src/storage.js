// Small localStorage helpers that never throw (private mode, blocked storage, etc.).
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    /* ignore */
  }
}
