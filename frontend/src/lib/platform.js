// Runtime platform detection. A future Android wrapper (e.g. Capacitor/TWA) can expose
// `window.TallSkillNative` to opt into native-only features such as rewarded ads.
export function getNativeBridge() {
  return typeof window !== 'undefined' ? window.TallSkillNative || null : null;
}

export function isAndroidApp() {
  const bridge = getNativeBridge();
  return Boolean(bridge && bridge.platform === 'android');
}

export function isStandalonePWA() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
