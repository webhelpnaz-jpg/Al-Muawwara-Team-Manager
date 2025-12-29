import React, { useState } from 'react';
import { Player, AttendanceRecord } from '../types';
import { useData } from '../contexts/DataContext';
import { Check, X, Clock, Save, UserCheck, AlertCircle } from 'lucide-react';

interface AttendanceTakerProps {
  teamId: string;
  onClose: () => void;
}

const AttendanceTaker: React.FC<AttendanceTakerProps> = ({ teamId, onClose }) => {
  const { getPlayersByTeam, markAttendance } = useData();
  const players = getPlayersByTeam(teamId);
  
  // Local state map: playerId -> status (undefined = unmarked)
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused' | undefined>>({});
  const today = new Date().toISOString().split('T')[0];

  const setStatus = (playerId: string, status: 'Present' | 'Absent' | 'Late') => {
    setRecords(prev => ({ ...prev, [playerId]: status }));
  };

  const markAllPresent = () => {
    const newRecords: any = {};
    players.forEach(p => newRecords[p.id] = 'Present');
    setRecords(newRecords);
  };

  const handleSave = () => {
    // Filter out unmarked
    const recordsToSave: AttendanceRecord[] = players
      .filter(p => records[p.id]) // Only save marked ones
      .map(p => ({
        id: `${p.id}-${today}`,
        playerId: p.id,
        teamId,
        date: today,
        status: records[p.id] as 'Present' | 'Absent' | 'Late' | 'Excused'
      }));

    if (recordsToSave.length < players.length) {
      if (!confirm(`You have only marked ${recordsToSave.length} out of ${players.length} students. Save anyway?`)) {
        return;
      }
    }

    markAttendance(recordsToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Mark Attendance</h2>
          <div className="text-sm text-slate-500">{today}</div>
        </div>
        <button 
          onClick={markAllPresent}
          className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition flex items-center"
        >
          <UserCheck size={14} className="mr-1" /> Mark All Present
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {players.map(player => {
          const status = records[player.id];
          return (
            <div 
              key={player.id} 
              className={`bg-white p-3 rounded-lg border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between ${status ? 'border-slate-300' : 'border-slate-200'}`}
            >
              <div className="mb-2 sm:mb-0 flex items-center">
                 {player.photoUrl ? (
                   <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover mr-3 bg-slate-100" />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3">
                     {player.name.charAt(0)}
                   </div>
                 )}
                 <div>
                   <div className="font-semibold text-slate-800">{player.name}</div>
                   <div className="text-xs text-slate-500">{player.position}</div>
                 </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setStatus(player.id, 'Present')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                    status === 'Present' 
                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-100' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Check size={16} className="mr-1" /> Present
                </button>
                <button
                  onClick={() => setStatus(player.id, 'Absent')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                    status === 'Absent' 
                      ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-100' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <X size={16} className="mr-1" /> Absent
                </button>
                <button
                  onClick={() => setStatus(player.id, 'Late')}
                  className={`flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                    status === 'Late' 
                      ? 'bg-yellow-500 text-white border-yellow-500 ring-2 ring-yellow-100' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Late"
                >
                  <Clock size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {players.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
               <AlertCircle size={48} className="mb-2 opacity-50" />
               <p>No players in this team roster.</p>
            </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 flex space-x-4 safe-area-bottom">
        <button 
          onClick={onClose}
          className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-lg shadow-lg flex justify-center items-center hover:bg-slate-800 transition"
        >
          <Save size={18} className="mr-2" /> Save Attendance
        </button>
      </div>
    </div>
  );
};

export default AttendanceTaker;