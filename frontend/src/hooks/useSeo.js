import { useEffect } from 'react';

/*
 * Lightweight, dependency-free per-route SEO head manager.
 *
 * Googlebot renders client-side JS, so setting the title / meta / canonical /
 * Open Graph / Twitter tags and injecting JSON-LD on mount is indexable. On
 * unmount every change is reverted to the value that was present before this
 * route mounted, so other routes keep the site-wide defaults from index.html.
 *
 * This NEVER touches application logic — it only manages document <head>.
 */

function upsertMeta(selector, attr, name, content, created) {
  if (content == null) return null;
  let el = document.head.querySelector(selector);
  let prev = null;
  if (el) {
    prev = { el, content: el.getAttribute('content') };
    el.setAttribute('content', content);
  } else {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute('content', content);
    document.head.appendChild(el);
    created.push(el);
  }
  return prev;
}

export default function useSeo({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  ogType = 'website',
  twitterImage,
  jsonLd = [],
} = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    const created = [];
    const changed = [];

    if (title) document.title = title;

    const push = (p) => p && changed.push(p);

    push(upsertMeta('meta[name="description"]', 'name', 'description', description, created));
    push(upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords, created));
    push(upsertMeta('meta[name="robots"]', 'name', 'robots', robots, created));

    push(upsertMeta('meta[property="og:title"]', 'property', 'og:title', ogTitle || title, created));
    push(upsertMeta('meta[property="og:description"]', 'property', 'og:description', ogDescription || description, created));
    push(upsertMeta('meta[property="og:type"]', 'property', 'og:type', ogType, created));
    push(upsertMeta('meta[property="og:url"]', 'property', 'og:url', ogUrl, created));
    push(upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImage, created));

    push(upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', ogTitle || title, created));
    push(upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription || description, created));
    push(upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage || ogImage, created));

    // Canonical.
    let canonicalPrev = null;
    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (link) {
        canonicalPrev = { el: link, href: link.getAttribute('href') };
        link.setAttribute('href', canonical);
      } else {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', canonical);
        document.head.appendChild(link);
        created.push(link);
      }
    }

    // JSON-LD structured data (route-scoped).
    const ldNodes = [];
    (jsonLd || []).forEach((obj, i) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-ld', `route-${i}`);
      s.text = JSON.stringify(obj);
      document.head.appendChild(s);
      ldNodes.push(s);
    });

    return () => {
      document.title = prevTitle;
      changed.forEach((p) => {
        if (p.content != null) p.el.setAttribute('content', p.content);
      });
      if (canonicalPrev) canonicalPrev.el.setAttribute('href', canonicalPrev.href);
      created.forEach((el) => el.remove());
      ldNodes.forEach((el) => el.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
