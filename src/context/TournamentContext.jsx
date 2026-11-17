import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';

const TournamentContext = createContext();

async function parseResponse(res) {
  const text = await res.text();
  if (!text) {
    throw new Error(
      res.status >= 500
        ? 'Backend server (port 5000) is not responding. Check your server terminal.'
        : `Empty response from server (HTTP ${res.status})`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid server response (HTTP ${res.status})`);
  }
}

export function TournamentProvider({ children }) {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('chess_td_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chess_td_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Landing Dashboard vs Active Tournament state
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [activeTournament, setActiveTournament] = useState(null);
  const [isDirector, setIsDirector] = useState(false);

  // Tournament workspace state
  const [activeTab, setActiveTab] = useState('details');
  const [currentRound, setCurrentRound] = useState(1);
  const [auditLogs, setAuditLogs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matchHistory, setMatchHistoryState] = useState([]);
  const [roundsData, setRoundsDataState] = useState({});

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }),
    [token]
  );

  // Fetch all events for the Landing Dashboard
  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch('/api/tournaments');
      if (res.ok) {
        const data = await parseResponse(res);
        setTournaments(data);
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Verify saved session on mount
  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? parseResponse(res) : Promise.reject()))
      .then(data => setUser(data.user))
      .catch(() => {
        setToken('');
        setUser(null);
        localStorage.removeItem('chess_td_token');
        localStorage.removeItem('chess_td_user');
      });
  }, [token]);

  // Hydrate selected tournament state whenever tournament or logged-in user changes
  const loadTournamentState = useCallback(
    async (tournamentId) => {
      if (!tournamentId) return;
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}/state`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await parseResponse(res);
        if (!res.ok) throw new Error(data.error || 'Failed to load tournament');

        setActiveTournament(data.tournament);
        setIsDirector(Boolean(data.isDirector));
        setPlayers(data.players || []);
        setRoundsDataState(data.roundsData || {});
        setMatchHistoryState(data.matchHistory || []);
        setAuditLogs(data.auditLogs || []);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedTournamentId) {
      loadTournamentState(selectedTournamentId);
    }
  }, [selectedTournamentId, loadTournamentState]);

  const openTournament = (tournamentId) => {
    setActiveTab('details');
    setCurrentRound(1);
    setSelectedTournamentId(tournamentId);
  };

  const closeTournament = () => {
    setSelectedTournamentId(null);
    setActiveTournament(null);
    setIsDirector(false);
    fetchTournaments();
  };

  // Auth Actions
  const saveSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('chess_td_token', newToken);
    localStorage.setItem('chess_td_user', JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveSession(data.token, data.user);
  };

  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    saveSession(data.token, data.user);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setIsDirector(false);
    localStorage.removeItem('chess_td_token');
    localStorage.removeItem('chess_td_user');
  };

  // Create new tournament on dashboard
  const createTournament = async (payload) => {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || 'Could not create tournament');
    setTournaments(prev => [data, ...prev]);
    return data;
  };

  // Delete entire tournament (Director only)
  const deleteTournament = async (tournamentId) => {
    const res = await fetch(`/api/tournaments/${tournamentId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || 'Failed to delete tournament');

    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    if (selectedTournamentId === tournamentId) {
      setSelectedTournamentId(null);
      setActiveTournament(null);
      setIsDirector(false);
    }
  };

  const appendAuditLog = (type, message) => {
    const entry = { timestamp: new Date().toLocaleTimeString(), type, message };
    setAuditLogs(prev => [...prev, entry]);
    if (!selectedTournamentId || !isDirector) return;

    fetch(`/api/tournaments/${selectedTournamentId}/logs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(entry)
    }).catch(console.error);
  };

  const startingRankings = useMemo(() => {
    return [...players].sort((a, b) => {
      const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [players]);

  const handleGeneratePairings = async (roundNum) => {
    if (!isDirector || !selectedTournamentId) return;
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings/generate/${roundNum}`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await parseResponse(res);

      if (data.logs?.length) setAuditLogs(prev => [...prev, ...data.logs]);
      if (!res.ok) throw new Error(data.error || 'Failed to generate pairings');

      setPlayers(data.players);
      setRoundsDataState(prev => ({
        ...prev,
        [roundNum]: data.roundData
      }));
      setActiveTab('pairings');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRevertPairing = async (roundNum) => {
    if (!isDirector || !selectedTournamentId) return;
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/pairings/${roundNum}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to revert pairings');

      setRoundsDataState(data.roundsData || {});
      setPlayers(data.players || []);
      setMatchHistoryState(data.matchHistory || []);
      if (data.log) setAuditLogs(prev => [...prev, data.log]);
    } catch (err) {
      alert(err.message);
    }
  };

  const addPlayer = async (newPlayer) => {
    if (!isDirector || !selectedTournamentId) return;
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/players`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newPlayer)
      });
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to add player');
      setPlayers(prev => [...prev, data]);
    } catch (err) {
      alert(err.message);
    }
  };

  const updatePlayer = async (updatedPlayer) => {
    if (!isDirector || !selectedTournamentId) return;
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/players/${updatedPlayer.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updatedPlayer)
      });
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to update player');
      setPlayers(prev => prev.map(p => (p.id === data.id ? data : p)));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleWithdrawPlayer = async (playerId) => {
    if (!isDirector || !selectedTournamentId) return;
    try {
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/players/${playerId}/withdraw`, {
        method: 'PATCH',
        headers: authHeaders
      });
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to toggle withdrawal');
      setPlayers(prev => prev.map(p => (p.id === data.id ? data : p)));
    } catch (err) {
      alert(err.message);
    }
  };

  const setRoundsData = (updater) => {
    if (!isDirector || !selectedTournamentId) return;
    setRoundsDataState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      fetch(`/api/tournaments/${selectedTournamentId}/rounds/sync`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ roundsData: next })
      }).catch(console.error);
      return next;
    });
  };

  const setMatchHistory = (updater) => {
    if (!isDirector || !selectedTournamentId) return;
    setMatchHistoryState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      fetch(`/api/tournaments/${selectedTournamentId}/matches/sync`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ matchHistory: next })
      }).catch(console.error);
      return next;
    });
  };

  return (
    <TournamentContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        tournaments,
        createTournament,
        deleteTournament,
        selectedTournamentId,
        activeTournament,
        isDirector,
        openTournament,
        closeTournament,
        activeTab,
        setActiveTab,
        currentRound,
        setCurrentRound,
        players,
        startingRankings,
        addPlayer,
        updatePlayer,
        toggleWithdrawPlayer,
        roundsData,
        setRoundsData,
        matchHistory,
        setMatchHistory,
        handleGeneratePairings,
        handleRevertPairing,
        auditLogs,
        appendAuditLog
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  return useContext(TournamentContext);
}