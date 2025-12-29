import React, { useState, useEffect } from 'react';
import { Player, AttendanceRecord } from '../types';
import { useData } from '../contexts/DataContext';
import { Check, X, Clock, Save, RotateCcw } from 'lucide-react';

interface AttendanceTakerProps {
  teamId: string;
  onClose: () => void;
}

const AttendanceTaker: React.FC<AttendanceTakerProps> = ({ teamId, onClose }) => {
  const { getPlayersByTeam, markAttendance } = useData();
  const players = getPlayersByTeam(teamId);
  
  // Local state map: playerId -> status
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Initialize all as Present by default
    const initial: any = {};
    players.forEach(p => initial[p.id] = 'Present');
    setRecords(initial);
  }, [players]);

  const toggleStatus = (playerId: string) => {
    setRecords(prev => {
      const current = prev[playerId];
      let next: 'Present' | 'Absent' | 'Late' = 'Present';
      if (current === 'Present') next = 'Absent';
      else if (current === 'Absent') next = 'Late';
      else if (current === 'Late') next = 'Present';
      return { ...prev, [playerId]: next };
    });
  };

  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = Object.keys(records).map(playerId => ({
      id: `${playerId}-${today}`,
      playerId,
      teamId,
      date: today,
      status: records[playerId]
    }));
    markAttendance(recordsToSave);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Absent': return 'bg-red-100 text-red-700 border-red-300';
      case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Mark Attendance</h2>
        <div className="text-sm text-slate-500">{today}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {players.map(player => (
          <div 
            key={player.id} 
            onClick={() => toggleStatus(player.id)}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex justify-between items-center
              ${getStatusColor(records[player.id])}
            `}
          >
            <div className="font-semibold text-lg">{player.name}</div>
            <div className="flex items-center font-bold uppercase text-sm">
              {records[player.id] === 'Present' && <Check size={20} className="mr-1" />}
              {records[player.id] === 'Absent' && <X size={20} className="mr-1" />}
              {records[player.id] === 'Late' && <Clock size={20} className="mr-1" />}
              {records[player.id]}
            </div>
          </div>
        ))}
        {players.length === 0 && (
            <p className="text-center text-slate-500 mt-10">No players in this team.</p>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 flex space-x-4 safe-area-bottom">
        <button 
          onClick={onClose}
          className="flex-1 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-lg shadow-lg flex justify-center items-center"
        >
          <Save size={18} className="mr-2" /> Save Records
        </button>
      </div>
    </div>
  );
};

export default AttendanceTaker;