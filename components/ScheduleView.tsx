import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, Plus, Trash } from 'lucide-react';

interface ScheduleViewProps {
  teamId?: string; // If undefined, shows all (for global calendar page)
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ teamId }) => {
  const { schedule, addEvent, teams } = useData();
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);

  // Filter events
  const events = teamId 
    ? schedule.filter(e => e.teamId === teamId)
    : schedule;

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const canEdit = teamId && (
    user?.role === 'Principal' || 
    user?.role === 'Master In-Charge' || 
    (user?.role === 'Coach' && user.assignedTeamId === teamId)
  );

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    
    addEvent({
      id: `evt-${Date.now()}`,
      teamId,
      title,
      date,
      startTime,
      endTime: '00:00', // Simplified
      location,
      type: 'Practice'
    });
    
    setShowAdd(false);
    setTitle('');
    setDate('');
    setStartTime('');
    setLocation('');
  };

  const getTeamName = (tId: string) => teams.find(t => t.id === tId)?.name || 'Unknown Team';

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Upcoming Events</h3>
        {canEdit && (
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center px-3 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition"
          >
            <Plus size={16} className="mr-2" /> Schedule Practice
          </button>
        )}
      </div>

      <div className="space-y-3">
        {events.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
            No upcoming events scheduled.
          </div>
        )}

        {events.map(event => (
          <div key={event.id} className="bg-white p-4 rounded-lg border border-l-4 border-slate-200 border-l-emerald-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-2 md:mb-0">
              <div className="flex items-center text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wide">
                {event.type} • {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
              </div>
              <h4 className="font-bold text-slate-800 text-lg">{event.title}</h4>
              {!teamId && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {getTeamName(event.teamId)}
                </span>
              )}
            </div>
            
            <div className="flex flex-col space-y-1 text-sm text-slate-600 md:text-right">
              <div className="flex items-center md:justify-end">
                <Clock size={14} className="mr-1" /> {event.startTime}
              </div>
              <div className="flex items-center md:justify-end">
                <MapPin size={14} className="mr-1" /> {event.location}
              </div>
            </div>
          </div>
        ))}
      </div>

       {/* Add Event Modal */}
       {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Schedule Practice</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                  placeholder="e.g. Regular Practice"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Time</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Venue</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                  placeholder="e.g. Main Ground"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;