import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrizeLeagueLogo from '../components/layout/PrizeLeagueLogo';
import '../styles/worldSelector.css';
import { FEATURES } from '../config/tallskill';

export default function WorldSelector() {
  const navigate = useNavigate();
  return (
    <main className="world-selector-page">
      <div className="earntour-worlds">
        <PrizeLeagueLogo size={56} />
        <h1>Welcome to TallSkill</h1>
        <p>Free-to-play skill championships. No deposits. No paid entry.</p>
        <div className={`earntour-world-grid${FEATURES.paidLeagues ? '' : ' earntour-world-grid-single'}`} data-testid="world-selector-grid">
          {FEATURES.paidLeagues && (
            <section className="earntour-world-card earntour-world-paid">
              <span aria-hidden="true" className="earntour-world-icon">🏆</span>
              <h2>Paid Leagues</h2>
              <p>Put your skills to the test in prize competitions.</p>
              <button type="button" onClick={() => navigate('/paid-leagues')}>Enter Paid Leagues <span aria-hidden="true">→</span></button>
            </section>
          )}
          <section className="earntour-world-card earntour-world-free">
            <span aria-hidden="true" className="earntour-world-icon">🌍</span>
            <h2>Free World</h2>
            <p>Explore the map, sharpen your skills and reach Champion challenges.</p>
            <ul><li>Free to play</li><li>Daily attempts</li><li>Championship progression</li></ul>
            <button type="button" data-testid="enter-free-world-btn" onClick={() => navigate('/world')}>Enter Free World <span aria-hidden="true">→</span></button>
          </section>
        </div>
        <p className="earntour-world-note">Your account and progress stay with you on web and mobile.</p>
      </div>
    </main>
  );
}
