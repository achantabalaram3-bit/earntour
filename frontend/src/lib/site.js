// Use the TallSkill deployment origin; never guess a production domain.
export const SITE_URL = (process.env.REACT_APP_SITE_URL || window.location.origin).replace(/\/$/, '');

// Resolve the domain-neutral HTML metadata before mounting route-specific SEO.
export function initializeSiteMetadata() {
  document.querySelectorAll('link[rel="canonical"], meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]').forEach((node) => {
    const attr = node.tagName === 'LINK' ? 'href' : 'content';
    const value = node.getAttribute(attr);
    if (value?.startsWith('/')) node.setAttribute(attr, `${SITE_URL}${value}`);
  });
  document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
    try {
      const data = JSON.parse(node.textContent, (key, value) =>
        ['url', 'logo', 'target'].includes(key) && typeof value === 'string' && value.startsWith('/')
          ? `${SITE_URL}${value}` : value);
      node.textContent = JSON.stringify(data);
    } catch { /* Leave unrelated structured data intact. */ }
  });
}
