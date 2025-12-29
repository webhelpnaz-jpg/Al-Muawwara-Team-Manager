import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Users } from 'lucide-react';
import TeamDetail from './TeamDetail'; // We'll create this inline component logic to keep it simple or separate if large

const Teams: React.FC = () => {
  const { teams } = useData();
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // If coach, only show their team or auto-select it
  const visibleTeams = user?.role === 'Coach' 
    ? teams.filter(t => t.id === user.assignedTeamId)
    : teams;

  const handleSelectTeam = (id: string) => {
    setSelectedTeamId(id);
  };

  if (selectedTeamId) {
    return <TeamDetail teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">School Teams</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTeams.map((team) => (
          <div 
            key={team.id}
            onClick={() => handleSelectTeam(team.id)}
            className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl bg-slate-50 p-3 rounded-lg">{team.icon}</div>
              <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition">
                <ChevronRight size={20} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">{team.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{team.category}</p>
            
            <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2 text-sm text-slate-600">
              <div className="flex items-center">
                <Users size={16} className="mr-2 text-slate-400" />
                Coach: {team.coachName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;