import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ArrowLeft, Calendar, UserCheck, ClipboardList, Settings, Download, Upload, FileSpreadsheet, Save, X } from 'lucide-react';
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
  const [editCoachName, setEditCoachName] = useState('');
  const [editCoachDate, setEditCoachDate] = useState('');

  if (!team) return <div>Team not found</div>;

  const isCoach = user?.role === UserRole.COACH && user.assignedTeamId === teamId;
  const isManagement = user?.role === UserRole.PRINCIPAL || user?.role === UserRole.MASTER_IN_CHARGE || user?.role === UserRole.ADMIN;
  
  // Specific permission for editing details (Admin/MIC only as per request)
  const canEditDetails = user?.role === UserRole.ADMIN || user?.role === UserRole.MASTER_IN_CHARGE;

  const handleOpenEditTeam = () => {
    setEditCoachName(team.coachName);
    setEditCoachDate(team.coachJoinedDate || '');
    setShowEditTeamModal(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam({
      ...team,
      coachName: editCoachName,
      coachJoinedDate: editCoachDate
    });
    setShowEditTeamModal(false);
  };

  const handleExportData = () => {
    // Generate CSV Content
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
      // In a real app, parse the file here. For demo:
      alert(`Successfully uploaded: ${file.name}. (Simulation: Data merged)`);
      event.target.value = ''; // Reset
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
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold">Edit Team Details</h3>
               <button onClick={() => setShowEditTeamModal(false)}><X size={24} className="text-slate-400" /></button>
             </div>
             <form onSubmit={handleSaveTeam} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700">Coach Name</label>
                   <input 
                      type="text" 
                      value={editCoachName}
                      onChange={(e) => setEditCoachName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                      required
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Coach Joined Date</label>
                   <input 
                      type="date" 
                      value={editCoachDate}
                      onChange={(e) => setEditCoachDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                   />
                </div>
                <div className="flex justify-end pt-4">
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
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl">{team.icon}</span>
                <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
              </div>
              <div className="flex flex-col text-sm text-slate-500 mt-1">
                 <span>Coach: <span className="font-medium text-slate-700">{team.coachName}</span></span>
                 {team.coachJoinedDate && <span>Joined: {new Date(team.coachJoinedDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {(isCoach || isManagement) && (
                <button 
                  onClick={() => setShowAttendance(true)}
                  className="flex items-center px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition shadow-sm"
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
               className="flex items-center justify-center px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded hover:bg-slate-200 border border-slate-200"
             >
               <Settings size={16} className="mr-2" /> Edit Coach Details
             </button>
             <button 
               onClick={handleExportData}
               className="flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded hover:bg-emerald-100 border border-emerald-200"
             >
               <Download size={16} className="mr-2" /> Download Excel/CSV
             </button>
             <button 
               onClick={handleImportClick}
               className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded hover:bg-blue-100 border border-blue-200"
             >
               <Upload size={16} className="mr-2" /> Upload Excel Sheet
             </button>
             {/* Hidden Input for File Upload */}
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