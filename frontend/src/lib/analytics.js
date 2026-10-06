// Analytics are opt-in per deployment. Nothing loads unless TallSkill's own IDs are configured.
const GA4_ID = process.env.REACT_APP_GA4_MEASUREMENT_ID;
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

function loadScript(src) {
  const el = document.createElement('script');
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
  return el;
}

function initGA4() {
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);
}

function initPostHog() {
  const el = loadScript(`${POSTHOG_HOST.replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.full.js`);
  el.crossOrigin = 'anonymous';
  el.onload = () => {
    window.posthog?.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, person_profiles: 'identified_only' });
  };
}

export function initAnalytics() {
  if (GA4_ID) initGA4();
  if (POSTHOG_KEY) initPostHog();
}
