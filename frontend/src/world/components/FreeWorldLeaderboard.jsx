import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trophy, X, Clock, RefreshCw, Radio, Crown, User, ChevronDown } from 'lucide-react';
import { worldAPI, worldContestAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import '../styles/pl-global-lb.css';

// App prize model (same formula the World Map uses): championDisplayPrize = 50*(n+1)
const championPrize = (n) => 50 * (Number(n) + 1);
const TOTAL_PRIZE_POOL = Array.from({ length: 100 }, (_, i) => championPrize(i + 1))
  .reduce((t, p) => t + p, 0);
const gbp0 = (v) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(v) || 0);
const gbp2 = (v) => {
  const n = Number(v) || 0;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
};

function nameOf(r) { return r?.user_name || r?.username || r?.display_name || 'Player'; }
function initials(name) {
  const p = String(name || 'P').trim().split(/\s+/).slice(0, 2);
  return (p.map((x) => x[0]).join('') || 'P').toUpperCase();
}
function fmtTime(ms) {
  const v = Math.max(0, Number(ms) || 0);
  if (!v) return '—';
  const s = Math.floor(v / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function rowWinnings(r) {
  const w = r?.prize_amount ?? r?.winnings ?? r?.prize ?? null;
  return w == null ? null : gbp2(w);
}

export default function FreeWorldLeaderboard({ open, onClose }) {
  const auth = useAuth();
  const myId = auth?.user?.user_id || auth?.user?.id || null;
  const myName = auth?.user?.name || auth?.user?.user_name || null;

  const [mode, setMode] = useState('global');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [endsIn, setEndsIn] = useState('');

  const load = useCallback(async (which) => {
    setLoading(true); setError('');
    try {
      const res = which === 'championship'
        ? await worldAPI.championLeaderboard()
        : await worldContestAPI.leaderboard();
      setData(res || { contest: null, leaderboard: [] });
    } catch (e) {
      setError('Leaderboard is temporarily unavailable.');
      setData(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (open) load(mode); }, [open, mode, load]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const contest = data?.contest || {};
  const endAt = contest?.end_at ? new Date(contest.end_at).getTime() : null;

  useEffect(() => {
    if (!open || !endAt) { setEndsIn(''); return undefined; }
    const tick = () => {
      const diff = endAt - Date.now();
      if (diff <= 0) { setEndsIn('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setEndsIn(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open, endAt]);

  const rows = useMemo(() => (Array.isArray(data?.leaderboard) ? data.leaderboard : []), [data]);
  const isMine = useCallback(
    (r) => (myId && String(r.user_id) === String(myId)) || (!myId && myName && nameOf(r) === myName),
    [myId, myName],
  );

  if (!open) return null;

  const myRow = rows.find(isMine) || null;
  const champLabel = contest?.contest_number ? `C${contest.contest_number}` : '—';
  const isLive = String(contest?.status || '').toLowerCase() === 'active';

  const rankBadge = (rank) => {
    if (rank === 1) return <span className="pl-global-lb-rk gold"><Crown size={13} /></span>;
    if (rank === 2) return <span className="pl-global-lb-rk silver">2</span>;
    if (rank === 3) return <span className="pl-global-lb-rk bronze">3</span>;
    return null;
  };

  const RankingsBody = () => {
    if (loading) return <div className="pl-global-lb-state" data-testid="lb-loading"><span className="pl-global-lb-spin" /><p>Loading rankings…</p></div>;
    if (error) return (
      <div className="pl-global-lb-state" data-testid="lb-error">
        <h4>Couldn’t load the leaderboard</h4><p>{error}</p>
        <button className="pl-global-lb-refresh" onClick={() => load(mode)} data-testid="lb-retry"><RefreshCw size={15} /> Try again</button>
      </div>
    );
    if (rows.length === 0) return (
      <div className="pl-global-lb-state" data-testid="lb-empty">
        <Trophy size={30} strokeWidth={1.6} /><h4>No rankings yet</h4>
        <p>Be the first to set a score in {mode === 'championship' ? 'this Championship' : 'Free World'}.</p>
      </div>
    );
    return (
      <div className="pl-global-lb-tablewrap" data-testid="lb-list">
        <div className="pl-global-lb-thead">
          <span>#</span><span>PLAYER</span><span>CHAMP</span><span>TIME</span><span className="ta-r">WINNINGS</span>
        </div>
        {rows.map((r) => {
          const win = rowWinnings(r);
          return (
            <div key={r.user_id || r.rank} className={`pl-global-lb-tr ${isMine(r) ? 'is-me' : ''}`} data-testid={isMine(r) ? 'lb-row-me' : 'lb-row'}>
              <span className="pl-global-lb-rankcell"><b>{r.rank}</b>{rankBadge(r.rank)}</span>
              <span className="pl-global-lb-player">
                <span className="pl-global-lb-av">{initials(nameOf(r))}</span>
                <span className="pl-global-lb-pn">{nameOf(r)}{isMine(r) && <em>YOU</em>}</span>
              </span>
              <span className="pl-global-lb-champ"><Trophy size={13} /> {r.champ || champLabel}</span>
              <span className="pl-global-lb-time"><Clock size={13} /> {fmtTime(r.duration_ms)}</span>
              <span className="pl-global-lb-win ta-r">{win || '—'}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="pl-global-lb-shell" role="dialog" aria-modal="true" aria-label="Global leaderboard" data-testid="global-leaderboard">
      <div className="pl-global-lb-inner">
        {/* HEADER */}
        <div className="pl-global-lb-card pl-global-lb-header">
          <div className="pl-global-lb-trophy"><Trophy size={30} /></div>
          <div className="pl-global-lb-htext">
            <span className="pl-global-lb-eyebrow">FREE WORLD</span>
            <h1>GLOBAL LEADERBOARD</h1>
            <p>Compete with players worldwide and win amazing prizes!</p>
          </div>
          {isLive && <span className="pl-global-lb-livepill" data-testid="lb-live"><i /> LIVE</span>}
          <button className="pl-global-lb-x" onClick={() => onClose?.()} data-testid="lb-close" aria-label="Close"><X size={20} /></button>
        </div>

        {/* STATS */}
        <div className="pl-global-lb-stats">
          <div className="pl-global-lb-card pl-global-lb-pool">
            <span className="pl-global-lb-coins">🪙</span>
            <div>
              <div className="pl-global-lb-poolamt" data-testid="lb-prize-pool">{gbp0(TOTAL_PRIZE_POOL)}</div>
              <div className="pl-global-lb-poollbl">Total Prize Pool</div>
            </div>
          </div>
          <div className="pl-global-lb-card pl-global-lb-ends">
            <Clock size={26} className="pl-global-lb-endsicon" />
            <div>
              <div className="pl-global-lb-endsval" data-testid="lb-ends-in">{endsIn || '—'}</div>
              <div className="pl-global-lb-endslbl">Ends In</div>
            </div>
          </div>
        </div>

        {/* PRIZE CALCULATION */}
        <div className="pl-global-lb-card pl-global-lb-prizecalc">
          <div className="pl-global-lb-sectlbl">PRIZE CALCULATION</div>
          <div className="pl-global-lb-prizes">
            <span className="pl-global-lb-prz"><i className="m1">1</i> 1st</span>
            <span className="pl-global-lb-dot" />
            <span className="pl-global-lb-prz"><i className="m2">2</i> 2nd</span>
            <span className="pl-global-lb-dot" />
            <span className="pl-global-lb-prz"><i className="m3">3</i> 3rd</span>
            <span className="pl-global-lb-dot" />
            <span className="pl-global-lb-prz">4th</span>
            <span className="pl-global-lb-dot" />
            <span className="pl-global-lb-prz">5th</span>
            <span className="pl-global-lb-note">Top {contest?.winner_count || 5} win</span>
          </div>
        </div>

        {/* VIEW SELECTOR */}
        <div className="pl-global-lb-card pl-global-lb-viewrow">
          <div className="pl-global-lb-select">
            <Trophy size={16} />
            <select value={mode} onChange={(e) => setMode(e.target.value)} data-testid="lb-mode-select" aria-label="View">
              <option value="global">All Championships (Global)</option>
              <option value="championship">Current Championship</option>
            </select>
            <ChevronDown size={16} className="pl-global-lb-selchev" />
          </div>
          {isLive && <span className="pl-global-lb-livepill green"><Radio size={13} /> LIVE</span>}
          <button className="pl-global-lb-refresh" onClick={() => load(mode)} data-testid="lb-refresh"><RefreshCw size={15} /> Refresh</button>
        </div>

        {/* YOUR POSITION */}
        {myRow && (
          <div className="pl-global-lb-card pl-global-lb-you" data-testid="lb-your-rank">
            <div className="pl-global-lb-sectlbl">YOUR POSITION</div>
            <div className="pl-global-lb-yourow">
              <span className="pl-global-lb-yourank">#{myRow.rank}</span>
              <span className="pl-global-lb-av sm"><User size={16} /></span>
              <span className="pl-global-lb-yn">{nameOf(myRow)}</span>
              <span className="pl-global-lb-champ"><Trophy size={13} /> {myRow.champ || champLabel}</span>
              <span className="pl-global-lb-time"><Clock size={13} /> {fmtTime(myRow.duration_ms)}</span>
              <span className="pl-global-lb-win">{rowWinnings(myRow) || '—'}</span>
            </div>
          </div>
        )}

        {/* RANKINGS */}
        <div className="pl-global-lb-card pl-global-lb-rankings">
          <div className="pl-global-lb-rankhead">
            <h2>{mode === 'championship' ? 'CHAMPIONSHIP RANKINGS' : 'GLOBAL RANKINGS'}</h2>
            {isLive && <span className="pl-global-lb-updates"><i /> UPDATES LIVE</span>}
          </div>
          <RankingsBody />
        </div>
      </div>
    </section>
  );
}
