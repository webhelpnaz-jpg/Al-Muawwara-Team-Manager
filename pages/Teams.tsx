import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Users } from 'lucide-react';
import TeamDetail from './TeamDetail';

const Teams: React.FC = () => {
  const { teams } = useData();
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Show all teams to all authorized users (Coaches, Admin, Principal, MIC)
  const visibleTeams = teams;

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
        {visibleTeams.map((team) => {
          const headCoach = team.coaches.find(c => c.role === 'Head Coach') || team.coaches[0];
          const assistantCount = team.coaches.length > 1 ? team.coaches.length - 1 : 0;

          return (
            <div 
              key={team.id}
              onClick={() => handleSelectTeam(team.id)}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="w-14 h-14 rounded-lg object-cover bg-slate-50" />
                ) : (
                  <div className="text-4xl bg-slate-50 p-3 rounded-lg">{team.icon}</div>
                )}
                <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition">
                  <ChevronRight size={20} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{team.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{team.category}</p>
              
              <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2 text-sm text-slate-600">
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-slate-400" />
                  <span className="truncate">
                    {headCoach ? headCoach.name : 'No Coach'}
                    {assistantCount > 0 && <span className="text-emerald-600 font-semibold ml-1">(+{assistantCount})</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Teams;