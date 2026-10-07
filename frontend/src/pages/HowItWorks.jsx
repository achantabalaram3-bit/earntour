import { SITE_URL } from '../lib/site';
import HowToPlaySection from '../components/home/HowToPlaySection';
import { ShieldCheck, Trophy, HeartHandshake, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';

const NOTES = [
  { Icon: ShieldCheck,    title: 'Fair & transparent', text: 'Every winner is verified per contest rules. Competition results are verified according to the published rules.' },
  { Icon: Trophy,         title: 'Real prizes',        text: 'From cash to gadgets to travel — real prizes, delivered after verification.' },
  { Icon: HeartHandshake, title: 'Responsible play',   text: '18+ only. Free to play — no deposits and no paid entry.' },
];

export default function HowItWorks() {
  useSeo({
    title: 'How TallSkill Works | Free-to-Play Skill Championships',
    description:
      'Learn how TallSkill works — a free-to-play skill championship platform for India. Play skill games and climb the leaderboard in four simple steps. 18+, free postal entry always available.',
    keywords:
      'how TallSkill works, skill championships, free skill games India',
    canonical: `${SITE_URL}/how-it-works`,
    robots: 'index, follow, max-image-preview:large',
    ogUrl: `${SITE_URL}/how-it-works`,
    ogImage: `${SITE_URL}/tallskill-og.png`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'How It Works', item: `${SITE_URL}/how-it-works` },
        ],
      },
    ],
  });

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pl-hero-bg text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 text-[#FFD54A] text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4" /> How It Works
          </div>
          <h1 className="mt-3 font-display font-extrabold text-4xl md:text-6xl">
            Play. Compete. <span className="pl-gold-text">Win.</span>
          </h1>
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            TallSkill is a premium skill-based prize competition platform. Four simple steps between you and your next prize.
          </p>
        </div>
      </section>

      <HowToPlaySection />

      {/* Trust notes */}
      <section className="pb-16 md:pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid md:grid-cols-3 gap-4">
          {NOTES.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <Icon className="w-8 h-8 text-[#16A34A]" />
              <h3 className="mt-3 font-display font-bold text-lg text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/competitions">
            <button className="pl-btn-gold px-8 py-3 rounded-full font-extrabold">PLAY NOW</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
