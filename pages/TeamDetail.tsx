import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CoachInfo } from '../types';
import { ArrowLeft, Calendar, UserCheck, ClipboardList, Settings, Download, Upload, Save, X, Plus, Trash2 } from 'lucide-react';
import PlayerList from '../components/PlayerList';
import AttendanceTaker from '../components/AttendanceTaker';
import ScheduleView from '../components/ScheduleView';

interface TeamDetailProps {
  teamId: string;
  onBack: () => void;
}

const TeamDetail: React.FC<TeamDetailProps> = ({ teamId, onBack }) => {
  const { teams, getPlayersByTeam, updateTeam } = useData();
  const { user } = useAuth();
  const team = teams.find(t => t.id === teamId);
  const players = getPlayersByTeam(teamId);
  
  const [activeTab, setActiveTab] = useState<'roster' | 'schedule'>('roster');
  const [showAttendance, setShowAttendance] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for Team Editing
  const [editCoaches, setEditCoaches] = useState<CoachInfo[]>([]);
  const [editLogoUrl, setEditLogoUrl] = useState('');

  if (!team) return <div>Team not found</div>;

  const isCoach = user?.role === UserRole.COACH && user.assignedTeamId === teamId;
  const isManagement = user?.role === UserRole.PRINCIPAL || user?.role === UserRole.MASTER_IN_CHARGE || user?.role === UserRole.ADMIN;
  const canEditDetails = user?.role === UserRole.ADMIN || user?.role === UserRole.MASTER_IN_CHARGE;

  const handleOpenEditTeam = () => {
    // Clone the coaches array to avoid direct mutation during edit
    setEditCoaches(team.coaches.map(c => ({...c})) || []);
    setEditLogoUrl(team.logoUrl || '');
    setShowEditTeamModal(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam({
      ...team,
      coaches: editCoaches,
      logoUrl: editLogoUrl
    });
    setShowEditTeamModal(false);
  };

  const handleCoachChange = (index: number, field: keyof CoachInfo, value: string) => {
    const updated = [...editCoaches];
    updated[index] = { ...updated[index], [field]: value };
    setEditCoaches(updated);
  };

  const handleAddCoach = () => {
    if (editCoaches.length < 3) {
      setEditCoaches([...editCoaches, { name: '', role: 'Assistant Coach', joinedDate: new Date().toISOString().split('T')[0] }]);
    }
  };

  const handleRemoveCoach = (index: number) => {
    const updated = editCoaches.filter((_, i) => i !== index);
    setEditCoaches(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = () => {
    const headers = ['Player Name', 'Grade', 'Position', 'Joined Date', 'Parent Contact', 'Attendance Rate %', 'Status'];
    const rows = players.map(p => [
      p.name,
      p.grade,
      p.position,
      p.joinedDate,
      p.contactParent,
      p.attendanceRate.toString(),
      p.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${team.name}_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`Successfully uploaded: ${file.name}. (Simulation: Data merged)`);
      event.target.value = ''; 
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Modal Overlay */}
      {showAttendance && (
        <AttendanceTaker teamId={teamId} onClose={() => setShowAttendance(false)} />
      )}

      {/* Team Editing Modal */}
      {showEditTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
           <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold">Edit Team Details</h3>
               <button onClick={() => setShowEditTeamModal(false)}><X size={24} className="text-slate-400" /></button>
             </div>
             <form onSubmit={handleSaveTeam} className="space-y-6">
                {/* Logo Uploader */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden mb-2 border border-slate-200 relative">
                     {editLogoUrl ? (
                       <img src={editLogoUrl} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-4xl">{team.icon}</span>
                     )}
                  </div>
                  <label className="cursor-pointer text-xs text-emerald-600 font-medium hover:text-emerald-700">
                    Change Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>

                {/* Coaches Section */}
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-slate-700">Coaching Staff (Max 3)</label>
                     {editCoaches.length < 3 && (
                       <button 
                         type="button" 
                         onClick={handleAddCoach}
                         className="text-xs flex items-center text-emerald-600 font-medium hover:text-emerald-700"
                       >
                         <Plus size={14} className="mr-1" /> Add Coach
                       </button>
                     )}
                   </div>
                   
                   <div className="space-y-3">
                     {editCoaches.map((coach, index) => (
                       <div key={index} className="bg-slate-50 p-3 rounded border border-slate-200 relative">
                          <button 
                             type="button" 
                             onClick={() => handleRemoveCoach(index)}
                             className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                             title="Remove Coach"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                             <div>
                               <label className="block text-xs font-medium text-slate-500">Name</label>
                               <input 
                                  type="text" 
                                  value={coach.name}
                                  onChange={(e) => handleCoachChange(index, 'name', e.target.value)}
                                  className="mt-1 block w-full text-sm rounded-md border-slate-300 border p-1.5"
                                  placeholder="Coach Name"
                                  required
                               />
                             </div>
                             <div>
                               <label className="block text-xs font-medium text-slate-500">Role</label>
                               <select 
                                  value={coach.role}
                                  onChange={(e) => handleCoachChange(index, 'role', e.target.value as any)}
                                  className="mt-1 block w-full text-sm rounded-md border-slate-300 border p-1.5 bg-white"
                               >
                                  <option value="Head Coach">Head Coach</option>
                                  <option value="Assistant Coach">Assistant Coach</option>
                               </select>
                             </div>
                             <div>
                               <label className="block text-xs font-medium text-slate-500">Joined Date</label>
                               <input 
                                  type="date" 
                                  value={coach.joinedDate}
                                  onChange={(e) => handleCoachChange(index, 'joinedDate', e.target.value)}
                                  className="mt-1 block w-full text-sm rounded-md border-slate-300 border p-1.5"
                               />
                             </div>
                          </div>
                       </div>
                     ))}
                     {editCoaches.length === 0 && (
                       <div className="text-sm text-slate-500 italic text-center py-2">No coaches assigned.</div>
                     )}
                   </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                   <button type="submit" className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                     <Save size={18} className="mr-2" /> Save Changes
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button 
              onClick={onBack}
              className="mr-4 p-2 rounded-full hover:bg-slate-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-4">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-4xl border border-slate-200">
                  {team.icon}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
                <div className="mt-2 space-y-1">
                  {team.coaches.map((coach, idx) => (
                    <div key={idx} className="flex items-center text-sm text-slate-600">
                       <span className={`font-semibold mr-2 ${coach.role === 'Head Coach' ? 'text-emerald-700' : 'text-slate-500'}`}>
                         {coach.role}:
                       </span>
                       <span className="text-slate-800 font-medium">{coach.name}</span>
                       <span className="text-slate-400 text-xs ml-2"> (Since {new Date(coach.joinedDate).getFullYear()})</span>
                    </div>
                  ))}
                  {team.coaches.length === 0 && <span className="text-slate-400 italic text-sm">No coaches assigned</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {(isCoach || isManagement) && (
                <button 
                  onClick={() => setShowAttendance(true)}
                  className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition shadow-sm"
                >
                  <UserCheck size={18} className="mr-2" />
                  Mark Attendance
                </button>
            )}
          </div>
        </div>

        {/* Management Controls for Admin/MIC */}
        {canEditDetails && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
             <button 
               onClick={handleOpenEditTeam}
               className="flex items-center justify-center px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200 border border-slate-200 transition"
             >
               <Settings size={16} className="mr-2" /> Edit Team & Coaches
             </button>
             <button 
               onClick={handleExportData}
               className="flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded hover:bg-emerald-100 border border-emerald-200 transition"
             >
               <Download size={16} className="mr-2" /> Download Excel/CSV
             </button>
             <button 
               onClick={handleImportClick}
               className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded hover:bg-blue-100 border border-blue-200 transition"
             >
               <Upload size={16} className="mr-2" /> Upload Excel Sheet
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               accept=".csv, .xlsx, .xls"
               className="hidden"
             />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roster')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'roster' 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
            `}
          >
            <ClipboardList size={16} className="mr-2" /> Roster
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'schedule' 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
            `}
          >
            <Calendar size={16} className="mr-2" /> Schedule
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'roster' && <PlayerList teamId={teamId} />}
        {activeTab === 'schedule' && <ScheduleView teamId={teamId} />}
      </div>
    </div>
  );
};

export default TeamDetail;