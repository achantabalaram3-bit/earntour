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
  { q: 'What is EarnTour Free World?', a: 'Free World is EarnTour\u2019s free-to-play skill-game experience. You progress through a map of Championships, each made up of ten skill-based levels plus a Champion challenge, competing for prizes through skill \u2014 no purchase needed to play.' },
  { q: 'Is Free World free to play?', a: 'Yes. Free World is free to play and you can progress through the levels for free. Optional token retries are available if you want extra attempts, but they are never required to advance.' },
  { q: 'How do Free World levels work?', a: 'Each Championship has ten skill levels built around the Number Sequence game \u2014 tap the numbers in order as quickly and accurately as you can. Level 1 is open immediately and the remaining levels unlock one per day at midnight (UK time).' },
  { q: 'What are Champion competitions?', a: 'After you clear all ten levels of a Championship you reach the Champion challenge. Champion results are ranked together on one global leaderboard, ordered by score and then speed, and completing it advances you to the next Championship.' },
  { q: 'How can I win a prize?', a: 'Prizes in Free World are earned through skill. The top-ranked finishers on the Champion leaderboard win prizes according to EarnTour\u2019s published competition rules. Placement depends only on score and speed, not on spending.' },
  { q: 'Who can participate?', a: 'Free World is open to eligible EarnTour players. Full eligibility, prize and participation details follow EarnTour\u2019s published Terms & Conditions.' },
];

const ROUTES = [
  {
    path: 'free-world',
    title: 'Free Skill Games & Prize Competitions UK | Free World \u2013 EarnTour',
    description:
      'Join Free World on EarnTour \u2014 free skill games in the UK. Progress through skill-based levels, reach Champion challenges and compete for prizes. Free to play, no purchase to progress.',
    keywords:
      'free skill games UK, free skill competitions UK, online skill games with prizes, skill-based prize competitions, free online competitions UK, play games to win prizes UK',
    ogImage: `${SITE}/og-free-world.png`,
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
        <p>Free World is EarnTour\u2019s free skill-gaming world for UK players. Progress through skill-based levels, reach Champion challenges and compete for prizes \u2014 all through skill, with no purchase needed to play.</p>
        <a href="/world">Play Free World</a>
        <h2>What is Free World?</h2>
        <p>Free World is the free, skill-based side of EarnTour. Instead of paying to enter, you play free skill games in the UK and climb a map of 100 Championships. Every Championship is built from ten skill levels and finishes with a Champion challenge.</p>
        <h2>How Free World works</h2>
        <ol>
          <li>Start at Championship 1, Level 1 \u2014 open immediately, no payment.</li>
          <li>Play a new skill level each day as it unlocks at midnight UK time.</li>
          <li>Clear all ten levels to reach the Champion challenge.</li>
          <li>Top the global Champion leaderboard to win prizes through skill.</li>
        </ol>
        <h2>Skill-based levels</h2>
        <p>Each level uses the Number Sequence game \u2014 tap the numbers in order as fast and accurately as you can. Your score is pure skill.</p>
        <h2>Champion progression</h2>
        <p>Clear all ten levels of a Championship to unlock its Champion challenge. Finishing it advances you to the next Championship, with past Championships kept as completed history.</p>
        <h2>Prizes</h2>
        <p>Champion results are ranked together on one global leaderboard by score and speed. The top finishers win prizes according to EarnTour\u2019s published competition rules.</p>
        <h2>Eligibility</h2>
        <p>Free World is free to play and open to eligible EarnTour players. Full eligibility, prize and participation details follow EarnTour\u2019s published Terms &amp; Conditions.</p>
        <h2>Free World FAQs</h2>
        ${faqSnippet(FREE_WORLD_FAQS)}
      </main>`,
  },
  {
    path: 'how-it-works',
    title: 'How EarnTour Works | Skill-Based Prize Competitions UK',
    description:
      'Learn how EarnTour works \u2014 a UK skill-based prize competition platform. Play skill games, enter competitions and win real prizes in four simple steps. 18+, free postal entry always available.',
    keywords:
      'how prize competitions work UK, skill-based prize competitions, play skill games UK, win prizes UK, free postal entry competitions',
    ogImage: `${SITE}/og-image.png`,
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
        <h1>How EarnTour Works \u2014 Play. Compete. Win.</h1>
        <p>EarnTour is a premium UK skill-based prize competition platform. There are four simple steps between you and your next prize: choose a competition, play the skill game, climb the leaderboard, and win verified prizes.</p>
        <p>Every winner is verified per the published contest rules. Prizes range from cash to gadgets to travel. EarnTour is 18+ only, you can set spend limits from your account, and a free postal entry route is always available.</p>
        <p><a href="/competitions">Browse competitions</a> or try <a href="/free-world">Free World</a> to play skill games for free.</p>
      </main>`,
  },
  {
    path: 'competitions',
    title: 'Skill Prize Competitions UK | Enter & Win | EarnTour',
    description:
      'Browse live skill-based prize competitions in the UK on EarnTour. Enter online competitions, play skill games and compete to win real prizes. 18+, free postal entry always available.',
    keywords:
      'skill-based prize competitions, online competitions UK, prize competitions UK, enter competitions to win, play games to win prizes UK',
    ogImage: `${SITE}/og-image.png`,
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
        <h1>Skill-Based Prize Competitions UK</h1>
        <p>Browse EarnTour\u2019s live skill-based prize competitions in the UK. Enter online competitions, play the skill game and compete to win real prizes. New competitions are added regularly.</p>
        <p>EarnTour is 18+ only and a free postal entry route is always available. Prefer to play for free first? Try <a href="/free-world">Free World</a>.</p>
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
