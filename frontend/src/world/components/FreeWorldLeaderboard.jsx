import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Globe, X, Crown, Trophy, RefreshCw, Users } from 'lucide-react';
import { worldAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import '../styles/pl-global-lb.css';

const TABS = [
  { id: 'global', label: 'Global' },
  { id: 'championship', label: 'Current Championship' },
];

function fmtScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2);
}

function nameOf(row) {
  return row?.user_name || row?.username || row?.display_name || 'Player';
}

function initials(name) {
  const parts = String(name || 'P').trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join('').toUpperCase() || 'P';
}

function contestLabel(contest) {
  if (!contest) return '';
  return (
    contest.name ||
    contest.title ||
    (contest.contest_number ? `Championship ${contest.contest_number}` : '')
  );
}

export default function FreeWorldLeaderboard({ open, onClose }) {
  const auth = useAuth();
  const myId = auth?.user?.user_id || auth?.user?.id || null;
  const myName = auth?.user?.name || auth?.user?.user_name || null;

  const [tab, setTab] = useState('global');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async (which) => {
    setLoading(true);
    setError('');
    try {
      const res = which === 'championship'
        ? await worldAPI.championLeaderboard()
        : await worldAPI.leaderboard();
      setData(res || { contest: null, leaderboard: [] });
    } catch (e) {
      setError('Leaderboard is temporarily unavailable.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) load(tab); }, [open, tab, load]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const rows = useMemo(
    () => (Array.isArray(data?.leaderboard) ? data.leaderboard : []),
    [data],
  );

  const isMine = useCallback(
    (row) => (myId && String(row.user_id) === String(myId)) ||
      (!!myName && !myId && nameOf(row) === myName),
    [myId, myName],
  );

  if (!open) return null;

  const contest = data?.contest || {};
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myRow = rows.find(isMine) || null;
  const myInTop = myRow && rows.indexOf(myRow) < 3;
  const clabel = contestLabel(contest);

  const Body = () => {
    if (loading) {
      return (
        <div className="pl-global-lb-state" data-testid="lb-loading">
          <div className="pl-global-lb-spinner" />
          <p>Loading rankings…</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="pl-global-lb-state" data-testid="lb-error">
          <h3>Couldn’t load the leaderboard</h3>
          <p>{error}</p>
          <button className="pl-global-lb-btn" onClick={() => load(tab)} data-testid="lb-retry">
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <div className="pl-global-lb-state" data-testid="lb-empty">
          <Users size={34} strokeWidth={1.6} />
          <h3>No rankings yet</h3>
          <p>Be the first to set a score in {tab === 'championship' ? 'this Championship' : 'Free World'}.</p>
        </div>
      );
    }
    return (
      <>
        <div className="pl-global-lb-podium" data-testid="lb-podium">
          {[top3[1], top3[0], top3[2]].map((row, i) => {
            if (!row) return <div key={`empty-${i}`} />;
            const place = row === top3[0] ? 1 : row === top3[1] ? 2 : 3;
            return (
              <div key={row.user_id || place} className={`pl-global-lb-pod p${place}`}>
                {place === 1 && <div className="pl-global-lb-crown">👑</div>}
                <div className="pl-global-lb-av">{initials(nameOf(row))}</div>
                <div className="pl-global-lb-medal">#{place}</div>
                <div className="pl-global-lb-name">{nameOf(row)}{isMine(row) ? ' (You)' : ''}</div>
                <div className="pl-global-lb-score">{fmtScore(row.score)}<small> pts</small></div>
              </div>
            );
          })}
        </div>

        <div className="pl-global-lb-list" data-testid="lb-list">
          {rest.map((row) => (
            <div
              key={row.user_id || row.rank}
              className={`pl-global-lb-row ${isMine(row) ? 'is-me' : ''}`}
              data-testid={isMine(row) ? 'lb-row-me' : 'lb-row'}
            >
              <div className="pl-global-lb-rank">{row.rank}</div>
              <div className="pl-global-lb-rowav">{initials(nameOf(row))}</div>
              <div className="pl-global-lb-rowname">
                {nameOf(row)}
                {isMine(row) && <span className="pl-global-lb-youtag">YOU</span>}
              </div>
              <div className="pl-global-lb-rowscore">{fmtScore(row.score)}<small>points</small></div>
            </div>
          ))}
        </div>

        {myRow && !myInTop && (
          <div className="pl-global-lb-you" data-testid="lb-your-rank">
            <div className="pl-global-lb-rank">{myRow.rank}</div>
            <div className="pl-global-lb-rowav">{initials(nameOf(myRow))}</div>
            <div className="pl-global-lb-rowname">Your rank</div>
            <div className="pl-global-lb-rowscore">{fmtScore(myRow.score)}<small>points</small></div>
          </div>
        )}
      </>
    );
  };

  return (
    <section
      className="pl-global-lb-shell"
      role="dialog"
      aria-modal="true"
      aria-label="Global leaderboard"
      data-testid="global-leaderboard"
    >
      <div className="pl-global-lb-inner">
        <header className="pl-global-lb-head">
          <div className="pl-global-lb-globe"><Globe size={24} strokeWidth={2.2} /></div>
          <div className="pl-global-lb-title">
            <h1>GLOBAL LEADERBOARD</h1>
            <p>Compete across Free World and climb the global rankings.</p>
          </div>
          <button className="pl-global-lb-close" onClick={() => onClose?.()} data-testid="lb-close">
            <X size={16} /> Close
          </button>
        </header>

        <div className="pl-global-lb-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`pl-global-lb-tab ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
              data-testid={`lb-tab-${t.id}`}
            >
              {t.id === 'championship' ? <Trophy size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> : null}
              {t.label}
            </button>
          ))}
        </div>

        {clabel && !loading && !error && rows.length > 0 && (
          <div className="pl-global-lb-contest" data-testid="lb-contest-label">{clabel}</div>
        )}

        <Body />
      </div>
    </section>
  );
}
