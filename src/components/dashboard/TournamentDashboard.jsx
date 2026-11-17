import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';

const BANNER_PRESETS = [
  {
    label: 'Royal Gold & Obsidian',
    url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Tournament Hall Clock',
    url: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Grandmaster Staunton',
    url: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=1200&q=80'
  }
];

function FallbackBanner({ title }) {
  return (
    <div className="w-full h-full bg-linear-to-br from-stone-900 via-stone-800 to-amber-950 flex flex-col justify-between p-5 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-8 text-amber-400/15 text-[140px] leading-none select-none pointer-events-none">
        ♞
      </div>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80">
        CSPRNG Swiss / Stochastic Engine
      </span>
      <p className="text-white/90 font-serif text-lg font-bold line-clamp-2 max-w-[85%]">{title}</p>
    </div>
  );
}

function TournamentCard({ tournament, isOwner, index, onOpen }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onOpen(tournament.id)}
      style={{ animationDelay: `${index * 70}ms` }}
      className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-[#E8E2D9] shadow-sm hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col animate-[fadeSlideUp_0.45s_ease-out_both]"
    >
      {/* Banner Preview Image */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-900">
        {tournament.bannerUrl && !imgError ? (
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <FallbackBanner title={tournament.title} />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-stone-950/80 text-white backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {tournament.status || 'Live'}
          </span>

          {isOwner ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-stone-950 shadow-md">
              ★ Tournament Director
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-stone-800 backdrop-blur-md">
              Spectator View
            </span>
          )}
        </div>

        {/* Bottom Overlay Meta */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-white">
          <span className="text-xs font-medium text-stone-200 truncate">{tournament.venue}</span>
          <span className="text-[11px] font-mono bg-black/55 px-2.5 py-0.5 rounded-full border border-white/15">
            {tournament.timeControl}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1.5">
            <span>{tournament.date}</span>
            <span>TD: {tournament.directorName}</span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {tournament.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {tournament.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Players</span>
              <span className="font-bold text-stone-900">{tournament.playerCount ?? 0}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Rounds</span>
              <span className="font-bold text-stone-900">
                {tournament.roundsGenerated ?? 0} / {tournament.totalRounds || 5}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#F8F5F0] group-hover:bg-amber-400 text-stone-900 transition-colors">
            {isOwner ? 'Manage Pairings' : 'View Event'}
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TournamentDashboard() {
  const { user, login, register, logout, tournaments, createTournament, openTournament } =
    useTournament();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    venue: 'Ghaziabad, Delhi NCR',
    date: new Date().toISOString().split('T')[0],
    timeControl: '15+10 Rapid',
    totalRounds: 5,
    bannerUrl: BANNER_PRESETS[0].url,
    description: ''
  });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
      } else {
        await register(authForm.name, authForm.email, authForm.password);
      }
      setAuthModalOpen(false);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createTournament(eventForm);
      setCreateModalOpen(false);
      openTournament(created.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-stone-900">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#F8F5F0]/85 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center text-xl font-bold shadow-sm">
              ♞
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-stone-900 leading-none">
                Shatranj Arena
              </h1>
              <p className="text-[11px] text-stone-500 mt-0.5">
                CSPRNG Stochastic Chess Pairing & Live Event Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-full text-xs shadow-sm transition-all hover:scale-[1.02]"
                >
                  + Host Tournament
                </button>
                <div className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 bg-white rounded-full border border-[#E8E2D9]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-stone-800">{user.name}</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-2.5 py-1 text-[11px] font-semibold text-stone-500 hover:text-rose-600 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthModalOpen(true);
                }}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-full text-xs shadow-sm transition-all"
              >
                Director Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-8 -bottom-10 text-amber-400/10 text-[210px] leading-none select-none pointer-events-none">
            ♚
          </div>
          <div className="max-w-2xl relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-4">
              Hardware-Entropy Pairing Engine
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Live Chess Tournaments &amp; Verifiable Pairings
            </h2>
            <p className="text-sm text-stone-300 mt-3 leading-relaxed">
              Browse active events, inspect live pairings and standings, or log in as a Tournament Director to manage players and run zero-rematch CSPRNG rounds.
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Active &amp; Upcoming Tournaments</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Select an event card to view pairings or open your Tournament Director console.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500 bg-white px-3.5 py-1.5 rounded-full border border-[#E8E2D9]">
            {tournaments.length} {tournaments.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E2D9] p-12 text-center">
            <div className="text-4xl mb-3">♟️</div>
            <h4 className="text-base font-bold text-stone-900">No tournaments hosted yet</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Log in or create a Tournament Director account to launch the first event with banner artwork and live CSPRNG pairings.
            </p>
            <button
              type="button"
              onClick={() => (user ? setCreateModalOpen(true) : setAuthModalOpen(true))}
              className="mt-5 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-full text-xs shadow-sm"
            >
              {user ? '+ Create First Tournament' : 'Login to Host Tournament'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t, idx) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                index={idx}
                isOwner={Boolean(user && user.id === t.directorId)}
                onOpen={openTournament}
              />
            ))}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {authMode === 'login' ? 'Tournament Director Login' : 'Create Director Account'}
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-sm">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    placeholder="e.g. Divye Kapoor"
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="director@shatranj.in"
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account & Continue'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-stone-500">
              {authMode === 'login' ? (
                <>
                  New organizer?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    Register as Tournament Director
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Host New Tournament Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">Host New Chess Tournament</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Shatranj Shaala Masters Cup 2026"
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Banner Preview + Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Banner Preview Image URL
                </label>
                <input
                  type="url"
                  value={eventForm.bannerUrl}
                  onChange={e => setEventForm({ ...eventForm, bannerUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BANNER_PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, bannerUrl: p.url })}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        eventForm.bannerUrl === p.url
                          ? 'bg-amber-400/20 border-amber-500 text-amber-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Venue</label>
                  <input
                    type="text"
                    value={eventForm.venue}
                    onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Time Control</label>
                  <input
                    type="text"
                    value={eventForm.timeControl}
                    onChange={e => setEventForm({ ...eventForm, timeControl: e.target.value })}
                    placeholder="e.g. 15+10 Rapid"
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Total Rounds</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={eventForm.totalRounds}
                    onChange={e => setEventForm({ ...eventForm, totalRounds: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Entry details, reporting time, and tournament rules..."
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold shadow-sm"
                >
                  Launch Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}