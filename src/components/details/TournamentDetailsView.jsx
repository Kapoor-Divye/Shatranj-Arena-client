import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';

export default function TournamentDetailsView() {
  const {
    activeTournament,
    players,
    roundsData,
    isDirector,
    setActiveTab,
    deleteTournament
  } = useTournament();
  const [imgError, setImgError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!activeTournament) return null;

  const activePlayersCount = players.filter(p => !p.isWithdrawn).length;
  const completedRoundsCount = Object.keys(roundsData).length;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${activeTournament.title}" permanently? All players, pairings, and scores in this event will be erased.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteTournament(activeTournament.id);
    } catch (err) {
      alert(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E2D9]">
      {/* Tournament Banner Preview */}
      <div className="relative h-64 sm:h-72 w-full bg-stone-900 overflow-hidden">
        {activeTournament.bannerUrl && !imgError ? (
          <img
            src={activeTournament.bannerUrl}
            alt={activeTournament.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 flex items-center justify-center">
            <span className="text-amber-400/20 text-[160px] select-none">{'\u265E'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-stone-950 mb-2.5">
              {activeTournament.status || 'Live'} Event
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeTournament.title}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Directed by <strong className="text-white">{activeTournament.directorName}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('players')}
              className="px-4 py-2.5 bg-white/95 hover:bg-white text-stone-900 font-bold rounded-full text-xs shadow-sm transition-all"
            >
              {isDirector ? 'Manage Players' : 'View Player List'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pairings')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-full text-xs shadow-sm transition-all"
            >
              {isDirector ? 'Open Pairing Engine' : 'View Live Pairings'} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Venue
            </span>
            <span className="text-sm font-bold text-stone-900 mt-1 block">
              {activeTournament.venue}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Event Date
            </span>
            <span className="text-sm font-bold text-stone-900 mt-1 block">
              {activeTournament.date}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Time Control
            </span>
            <span className="text-sm font-bold text-stone-900 mt-1 block">
              {activeTournament.timeControl}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
              Participation &amp; Rounds
            </span>
            <span className="text-sm font-bold text-stone-900 mt-1 block">
              {activePlayersCount} Players &bull; {completedRoundsCount}/{activeTournament.totalRounds || 5} Rounds
            </span>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Tournament Overview &amp; Pairing Protocol
          </h3>
          <p className="text-sm text-stone-700 leading-relaxed">
            {activeTournament.description}
          </p>
        </div>

        {/* Director Danger Zone */}
        {isDirector && (
          <div className="mt-8 pt-5 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Director Event Controls
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Permanently remove this tournament and all associated pairing records from the dashboard.
              </p>
            </div>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 font-bold rounded-full text-xs transition-all self-start sm:self-auto disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Tournament'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}