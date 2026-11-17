import { useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';

import TournamentDashboard from './components/dashboard/TournamentDashboard';
import Header from './components/layout/Header';
import ActionBanner from './components/layout/ActionBanner';
import TournamentDetailsView from './components/details/TournamentDetailsView';
import PlayerList from './components/players/PlayerList';
import PairingsView from './components/pairings/PairingsView';
import ScoreUploadView from './components/scores/ScoreUploadView';
import StandingsTable from './components/standings/StandingsTable';
import AuditDrawer from './components/audit/AuditDrawer';

function MainLayout() {
  const { selectedTournamentId, activeTab, isDirector } = useTournament();
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Landing Page: Modern Tournament Dashboard
  if (!selectedTournamentId) {
    return <TournamentDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans antialiased text-stone-900 pb-16">
      <Header onOpenAudit={() => setIsAuditOpen(true)} />

      <main className="max-w-7xl mx-auto px-6">
        <ActionBanner />

        <section className="py-6">
          {activeTab === 'details' && <TournamentDetailsView />}
          {activeTab === 'players' && <PlayerList />}
          {activeTab === 'pairings' && <PairingsView />}
          {activeTab === 'standings' && <StandingsTable />}
          {activeTab === 'scores' && isDirector && <ScoreUploadView />}
        </section>
      </main>

      <AuditDrawer isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <MainLayout />
    </TournamentProvider>
  );
}