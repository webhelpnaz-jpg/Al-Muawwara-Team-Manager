import React from 'react';
import ScheduleView from '../components/ScheduleView';

const GlobalSchedule: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Master Schedule</h1>
      <p className="text-slate-500">View upcoming practices and matches for all teams.</p>
      <ScheduleView />
    </div>
  );
};

export default GlobalSchedule;