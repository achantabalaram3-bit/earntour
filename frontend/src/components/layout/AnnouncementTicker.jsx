import { useEffect, useState } from 'react';
import { contestsAPI } from '../../lib/api';

/**
 * Announcement ticker — smooth right-to-left marquee under the nav.
 * Pauses on hover (desktop). Fully responsive.
 *
 * When the latest Championship has been FINALIZED/SETTLED, this same global
 * bar shows its real winners (public display name + authoritative GBP prize
 * from the stored award ledger). It never uses provisional positions and
 * never recalculates prizes. When no Championship is finalized yet, it falls
 * back to the promo announcements below.
 */
const PROMO_ITEMS = [
  { icon: '🎉', text: 'Play Skill-Based Games' },
  { icon: '⚡', text: 'Enter Exciting Contests' },
  { icon: '🏆', text: 'Win Amazing Prizes with Prize League' },
  { icon: '✨', text: 'New contests every week — brand-new skill games each drop' },
];

function formatPrize(amount, currency) {
  const symbol = currency === 'GBP' ? '£' : '';
  return `${symbol}${Number(amount).toLocaleString()}`;
}

export default function AnnouncementTicker() {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    const load = () =>
      contestsAPI.championWinners?.()
        .then((d) => setWinners(Array.isArray(d?.winners) ? d.winners : []))
        .catch(() => setWinners([]));
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const hasWinners = winners.length > 0;

  const chunk = (
    <div className="flex items-center gap-12 shrink-0 whitespace-nowrap" aria-hidden="false">
      {hasWinners
        ? winners.map((w) => (
            <span
              key={`champ-winner-${w.rank}`}
              className="inline-flex items-center gap-2 text-white font-semibold text-sm md:text-[15px]"
              data-testid={`champ-winner-${w.rank}`}
            >
              <span aria-hidden>🏆</span>
              <span>
                <span className="text-white">{w.user_name}</span>
                <span className="text-white/90"> won </span>
                <span className="text-[#FFD54A] font-bold">
                  {formatPrize(w.prize_amount, w.currency)}
                </span>
              </span>
              <span className="text-[#FFD54A] mx-1">•</span>
            </span>
          ))
        : PROMO_ITEMS.map((it) => (
            <span
              key={it.text}
              className="inline-flex items-center gap-2 text-white/95 font-semibold text-sm md:text-[15px]"
            >
              <span aria-hidden>{it.icon}</span>
              <span>{it.text}</span>
              <span className="text-[#FFD54A] mx-1">•</span>
            </span>
          ))}
    </div>
  );

  return (
    <div
      className="pl-marquee relative z-30 block w-full shrink-0 overflow-hidden border-y border-white/10"
      style={{ background: 'linear-gradient(90deg, #6C2BFF 0%, #8B5CFF 50%, #6C2BFF 100%)' }}
      data-testid="announcement-ticker"
      aria-label={hasWinners ? 'Championship winners' : 'Announcements'}
    >
      <div className="pl-marquee-track py-2.5">
        {chunk}
        {chunk}
      </div>
    </div>
  );
}
