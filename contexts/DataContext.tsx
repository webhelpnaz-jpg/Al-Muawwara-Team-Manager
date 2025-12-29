import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Team, Player, ScheduleEvent, AttendanceRecord } from '../types';
import { MOCK_TEAMS, MOCK_PLAYERS, MOCK_SCHEDULE, MOCK_ATTENDANCE } from '../services/mockData';

interface DataContextType {
  teams: Team[];
  players: Player[];
  schedule: ScheduleEvent[];
  attendance: AttendanceRecord[];
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  updateTeam: (team: Team) => void; // New function
  markAttendance: (records: AttendanceRecord[]) => void;
  addEvent: (event: ScheduleEvent) => void;
  getPlayersByTeam: (teamId: string) => Player[];
  getEventsByTeam: (teamId: string) => ScheduleEvent[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(MOCK_SCHEDULE);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const markAttendance = (records: AttendanceRecord[]) => {
    // Remove existing records for the same day/team/player if any (simple overwrite logic)
    setAttendance(prev => {
        const newIds = new Set(records.map(r => `${r.playerId}-${r.date}`));
        const filtered = prev.filter(r => !newIds.has(`${r.playerId}-${r.date}`));
        return [...filtered, ...records];
    });
  };

  const addEvent = (event: ScheduleEvent) => {
    setSchedule(prev => [...prev, event]);
  };

  const getPlayersByTeam = (teamId: string) => players.filter(p => p.teamId === teamId);
  const getEventsByTeam = (teamId: string) => schedule.filter(e => e.teamId === teamId);

  const value = useMemo(() => ({
    teams,
    players,
    schedule,
    attendance,
    addPlayer,
    updatePlayer,
    deletePlayer,
    updateTeam,
    markAttendance,
    addEvent,
    getPlayersByTeam,
    getEventsByTeam
  }), [teams, players, schedule, attendance]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};