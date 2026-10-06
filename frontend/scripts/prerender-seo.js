/*
 * Build-time SEO prerender (zero dependencies, React-19 safe).
 *
 * After `craco build`, this writes a true static `build/<route>/index.html`
 * for each public SEO route with:
 *   - the correct <title>, meta description/keywords/robots, canonical,
 *     Open Graph + Twitter tags and JSON-LD injected into <head>, and
 *   - a crawlable content snapshot inside <div id="root"> so crawlers that do
 *     NOT execute JavaScript still receive full HTML.
 *
 * React then mounts normally in the browser and replaces the snapshot, so the
 * live experience is unchanged. This script NEVER throws — any problem logs a
 * warning and exits 0 so a deploy build can never be broken by it.
 */
const fs = require('fs');
const path = require('path');

const SITE = (process.env.REACT_APP_SITE_URL || '').replace(/\/$/, '');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const SRC = path.join(BUILD_DIR, 'index.html');

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function faqSnippet(faqs) {
  return faqs
    .map(
      (f) =>
        `<div><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`,
    )
    .join('');
}

const FREE_WORLD_FAQS = [
  { q: 'What is TallSkill Free World?', a: 'Free World is TallSkill\u2019s free-to-play skill-game experience. You progress through a map of Championships, each made up of ten skill-based levels plus a Champion challenge, competing for prizes through skill \u2014 no purchase needed to play.' },
  { q: 'Is Free World free to play?', a: 'Yes. Free World is free to play and you can progress through the levels for free. Optional TallSkill Coin retries may be offered for extra attempts, but they are never required to advance. Coins cannot be bought.' },
  { q: 'How do Free World levels work?', a: 'Each Championship has ten skill levels built around the Number Sequence game \u2014 tap the numbers in order as quickly and accurately as you can. Level 1 is open immediately and the remaining levels unlock one per day at midnight (India Standard Time).' },
  { q: 'What are Champion competitions?', a: 'After you clear all ten levels of a Championship you reach the Champion challenge. Champion results are ranked together on one global leaderboard, ordered by score and then speed, and completing it advances you to the next Championship.' },
  { q: 'How can I win a prize?', a: 'Prizes in Free World are earned through skill. The top-ranked finishers on the Champion leaderboard win prizes according to TallSkill\u2019s published competition rules. Placement depends only on score and speed, not on spending.' },
  { q: 'Who can participate?', a: 'Free World is open to eligible TallSkill players. Full eligibility, prize and participation details follow TallSkill\u2019s published Terms & Conditions.' },
];

const ROUTES = [
  {
    path: 'free-world',
    title: 'Free Skill Games & Championships | Free World \u2013 TallSkill',
    description:
      'Join Free World on TallSkill \u2014 free skill games in India. Progress through skill-based levels, reach Champion challenges and compete for prizes. Free to play, no purchase to progress.',
    keywords:
      'free skill games India, free skill championships, online skill games, skill-based competitions, free to play games India',
    ogImage: `${SITE}/tallskill-og-free-world.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Free World', item: `${SITE}/free-world` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FREE_WORLD_FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
    body: `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Free World</span></nav>
      <main>
        <h1>Free World \u2013 Play Skill Games &amp; Compete for Prizes</h1>
        <p>Free World is TallSkill\u2019s free skill-gaming world for players in India. Progress through skill-based levels, reach Champion challenges and compete for prizes \u2014 all through skill, with no purchase needed to play.</p>
        <a href="/world">Play Free World</a>
        <h2>What is Free World?</h2>
        <p>Free World is the free, skill-based side of TallSkill. Instead of paying to enter, you play free skill games and climb a map of 100 Championships. Every Championship is built from ten skill levels and finishes with a Champion challenge.</p>
        <h2>How Free World works</h2>
        <ol>
          <li>Start at Championship 1, Level 1 \u2014 open immediately, no payment.</li>
          <li>Play a new skill level each day as it unlocks at midnight India Standard Time.</li>
          <li>Clear all ten levels to reach the Champion challenge.</li>
          <li>Top the global Champion leaderboard to win prizes through skill.</li>
        </ol>
        <h2>Skill-based levels</h2>
        <p>Each level uses the Number Sequence game \u2014 tap the numbers in order as fast and accurately as you can. Your score is pure skill.</p>
        <h2>Champion progression</h2>
        <p>Clear all ten levels of a Championship to unlock its Champion challenge. Finishing it advances you to the next Championship, with past Championships kept as completed history.</p>
        <h2>Prizes</h2>
        <p>Champion results are ranked together on one global leaderboard by score and speed. The top finishers win prizes according to TallSkill\u2019s published competition rules.</p>
        <h2>Eligibility</h2>
        <p>Free World is free to play and open to eligible TallSkill players. Full eligibility, prize and participation details follow TallSkill\u2019s published Terms &amp; Conditions.</p>
        <h2>Free World FAQs</h2>
        ${faqSnippet(FREE_WORLD_FAQS)}
      </main>`,
  },
  {
    path: 'how-it-works',
    title: 'How TallSkill Works | Free-to-Play Skill Championships',
    description:
      'Learn how TallSkill works \u2014 a free-to-play skill championship platform for India. No deposits and no paid entry.',
    keywords:
      'how TallSkill works, skill championships, free skill games India, free to play',
    ogImage: `${SITE}/tallskill-og.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'How It Works', item: `${SITE}/how-it-works` },
        ],
      },
    ],
    body: `
      <main>
        <h1>How TallSkill Works \u2014 Play. Compete. Win.</h1>
        <p>TallSkill is a free-to-play skill championship platform for India. Play the skill game, climb the leaderboard and progress through Championships. There are no deposits and no paid entry.</p>
        <p>Every winner is verified per the published championship rules. Eligibility and prize terms are subject to TallSkill\u2019s published Terms &amp; Conditions.</p>
        <p><a href="/competitions">Browse competitions</a> or try <a href="/free-world">Free World</a> to play skill games for free.</p>
      </main>`,
  },
  {
    path: 'competitions',
    title: 'Skill Championships | TallSkill',
    description:
      'Browse skill-based championships on TallSkill. Free to play \u2014 no deposits, no paid entry.',
    keywords:
      'skill championships, free skill games India, skill-based competitions',
    ogImage: `${SITE}/tallskill-og.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Competitions', item: `${SITE}/competitions` },
        ],
      },
    ],
    body: `
      <main>
        <h1>Skill-Based Championships</h1>
        <p>Browse TallSkill\u2019s skill-based championships. Free to play \u2014 no deposits and no paid entry.</p>
        <p>Start with <a href="/free-world">Free World</a>.</p>
      </main>`,
  },
];

function replaceOrInsertHead(html, regex, tag) {
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `    ${tag}\n</head>`);
}

function buildHead(html, route) {
  const url = `${SITE}/${route.path}`;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(route.title)}</title>`);

  const metas = [
    [/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${esc(route.description)}" />`],
    [/<meta\s+name="keywords"[^>]*>/i, `<meta name="keywords" content="${esc(route.keywords)}" />`],
    [/<meta\s+name="robots"[^>]*>/i, `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`],
    [/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}" />`],
    [/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(route.title)}" />`],
    [/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(route.description)}" />`],
    [/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}" />`],
    [/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${esc(route.ogImage)}" />`],
    [/<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="website" />`],
    [/<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(route.title)}" />`],
    [/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${esc(route.description)}" />`],
    [/<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${esc(route.ogImage)}" />`],
  ];
  for (const [re, tag] of metas) html = replaceOrInsertHead(html, re, tag);

  const ld = (route.jsonLd || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('\n    ');
  if (ld) html = html.replace('</head>', `    ${ld}\n</head>`);

  return html;
}

function run() {
  if (!fs.existsSync(SRC)) {
    console.warn('[prerender-seo] build/index.html not found \u2014 skipping (not a production build).');
    return;
  }
  let base = fs.readFileSync(SRC, 'utf8');
  if (SITE) {
    base = base.replace(/(<(?:link|meta)\b[^>]*(?:href|content)=")\/(?!\/)/g, `$1${SITE}/`)
      .replace(/("(?:url|logo|target)":\s*")\/(?!\/)/g, `$1${SITE}/`);
    fs.writeFileSync(SRC, base, 'utf8');
    const paths = ['', 'free-world', 'competitions', 'how-it-works', 'winners', 'leaderboard', 'draw-centre', 'refer', 'free-entry', 'faq', 'stories', 'terms', 'privacy', 'cookies', 'responsible', 'complaints', 'refunds'];
    fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map(p => `<url><loc>${esc(SITE)}/${p}</loc></url>`).join('') + '</urlset>');
    fs.appendFileSync(path.join(BUILD_DIR, 'robots.txt'), `\nSitemap: ${SITE}/sitemap.xml\n`);
  } else {
    console.warn('[prerender-seo] Set REACT_APP_SITE_URL for absolute production SEO URLs and sitemap.');
  }

  for (const route of ROUTES) {
    try {
      let html = buildHead(base, route);
      html = html.replace(
        /<div id="root">\s*<\/div>/i,
        `<div id="root"><div data-prerender="seo">${route.body}</div></div>`,
      );
      const dir = path.join(BUILD_DIR, route.path);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
      console.log(`[prerender-seo] wrote build/${route.path}/index.html`);
    } catch (e) {
      console.warn(`[prerender-seo] failed for ${route.path}:`, e && e.message);
    }
  }
}

try {
  run();
} catch (e) {
  console.warn('[prerender-seo] non-fatal error:', e && e.message);
}
process.exit(0);
