import React, { useState, useMemo } from 'react';
import { Player, AttendanceRecord, Team } from '../types';
import { useData } from '../contexts/DataContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Info
} from 'lucide-react';

interface PlayerAttendanceCalendarProps {
  player: Player;
}

const PlayerAttendanceCalendar: React.FC<PlayerAttendanceCalendarProps> = ({ player }) => {
  const { attendance, teams } = useData();
  const [viewDate, setViewDate] = useState(new Date());

  const playerAttendance = useMemo(() => {
    return attendance.filter(a => a.playerId === player.id);
  }, [attendance, player.id]);

  const team = teams.find(t => t.id === player.teamId);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = startDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getAttendanceForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return playerAttendance.find(a => a.date === dateStr);
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center">
          <CalendarIcon className="text-emerald-600 mr-2" size={20} />
          <h3 className="font-bold text-slate-800">Attendance History: {player.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded transition"><ChevronLeft size={20}/></button>
          <span className="text-sm font-semibold w-24 text-center">{monthName} {year}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded transition"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="p-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">{d}</div>
          ))}
          
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 sm:h-16 bg-slate-50/50 rounded-lg"></div>
          ))}

          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const record = getAttendanceForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <div 
                key={day} 
                className={`h-12 sm:h-16 relative rounded-lg border border-slate-100 transition-all flex flex-col items-center justify-center
                  ${isToday ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:bg-slate-50'}
                `}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-emerald-700' : 'text-slate-500'}`}>{day}</span>
                {record && (
                  <div className={`mt-1 flex items-center justify-center`}>
                    {record.status === 'Present' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {record.status === 'Absent' && <XCircle size={16} className="text-red-500" />}
                    {record.status === 'Late' && <Clock size={16} className="text-amber-500" />}
                    {record.status === 'Excused' && <Info size={16} className="text-blue-500" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 justify-center">
          <div className="flex items-center"><CheckCircle2 size={14} className="text-emerald-500 mr-1" /> Present</div>
          <div className="flex items-center"><XCircle size={14} className="text-red-500 mr-1" /> Absent</div>
          <div className="flex items-center"><Clock size={14} className="text-amber-500 mr-1" /> Late</div>
          <div className="flex items-center"><Info size={14} className="text-blue-500 mr-1" /> Excused</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerAttendanceCalendar;