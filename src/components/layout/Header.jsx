import React from 'react';
import { useTournament } from '../../context/TournamentContext';

export default function Header({ onOpenAudit }) {
  const {
    activeTab,
    setActiveTab,
    activeTournament,
    isDirector,
    closeTournament
  } = useTournament();

  const navigationTabs = [
    { id: 'details', label: 'Details', disabled: false },
    { id: 'players', label: 'Player Management', disabled: false },
    { id: 'pairings', label: 'Pairings', disabled: false },
    { id: 'standings', label: 'Standings', disabled: false },
    ...(isDirector ? [{ id: 'scores', label: 'Score Upload', disabled: false }] : []),
    { id: 'prize_mgmt', label: 'Prize Management', disabled: true },
    { id: 'prize_dist', label: 'Prize Distribution', disabled: true },
    { id: 'terms', label: 'Commercial Terms', disabled: true }
  ];

  return (
    <header className="border-b border-[#E8E2D9] bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <div>
            <button
              type="button"
              onClick={closeTournament}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors"
            >
              <span>←</span> Back to All Tournaments
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-stone-900">
                {activeTournament?.title || 'Tournament'}
              </h1>
              {isDirector ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-stone-950 shadow-sm">
                  ★ Tournament Director
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-200/80 text-stone-700">
                  Spectator (Read-Only)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAudit}
            className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs font-mono bg-stone-900 text-stone-100 rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CSPRNG Telemetry
          </button>
        </div>

        <nav className="flex space-x-7 overflow-x-auto no-scrollbar">
          {navigationTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-500 text-stone-900 font-semibold'
                    : tab.disabled
                    ? 'border-transparent text-stone-400 cursor-not-allowed'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}