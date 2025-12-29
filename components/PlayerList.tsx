import React, { useState } from 'react';
import { Player, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Edit2, Trash2, Phone, Activity, Plus, X, Camera } from 'lucide-react';

interface PlayerListProps {
  teamId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ teamId }) => {
  const { user } = useAuth();
  const { getPlayersByTeam, addPlayer, deletePlayer, updatePlayer } = useData();
  const players = getPlayersByTeam(teamId);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const initialFormState: Player = {
    id: '',
    teamId: teamId,
    name: '',
    grade: '',
    position: 'Member',
    contactParent: '',
    dob: '',
    joinedDate: new Date().toISOString().split('T')[0],
    emergencyContactName: '',
    emergencyContactPhone: '',
    performanceNotes: '',
    medicalNotes: '',
    attendanceRate: 100,
    status: 'Active',
    photoUrl: ''
  };

  const [formData, setFormData] = useState<Player>(initialFormState);

  const canEdit = user?.role === UserRole.PRINCIPAL || 
                  user?.role === UserRole.MASTER_IN_CHARGE || 
                  (user?.role === UserRole.COACH && user.assignedTeamId === teamId);

  const handleOpenAdd = () => {
    setFormData({ ...initialFormState, id: `new-${Date.now()}` });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (player: Player) => {
    setFormData(player);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updatePlayer(formData);
    } else {
      addPlayer(formData);
    }
    setShowModal(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Roster ({players.length})</h3>
        {canEdit && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center px-3 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition"
          >
            <Plus size={16} className="mr-2" /> Add Player
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between group relative">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {player.photoUrl ? (
                     <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      player.status === 'Injured' ? 'bg-red-500' : 'bg-slate-400'
                    }`}>
                      {player.name.charAt(0)}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-slate-900">{player.name}</h4>
                    <p className="text-xs text-slate-500">{player.position} • Grade {player.grade}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex space-x-1">
                     <button onClick={() => handleOpenEdit(player)} className="text-slate-400 hover:text-emerald-500 p-1">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deletePlayer(player.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center" title="Parent Contact">
                    <Phone size={14} className="mr-2 opacity-70" /> {player.contactParent}
                </div>
                <div className="flex items-center" title="Attendance">
                    <Activity size={14} className="mr-2 opacity-70 text-emerald-500" /> {player.attendanceRate}% Attendance
                </div>
                {player.performanceNotes && (
                   <div className="mt-2 bg-slate-50 p-2 rounded text-xs italic border border-slate-100">
                      "{player.performanceNotes}"
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Player Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold">{isEditing ? 'Edit Player' : 'Add New Player'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
               
               {/* Photo Upload */}
               <div className="flex justify-center mb-6">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                       {formData.photoUrl ? (
                         <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <Camera size={32} className="text-slate-400" />
                       )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-emerald-700 transition-colors">
                      <Camera size={14} />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                 </div>
               </div>

               {/* Personal Info */}
               <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Personal Details</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Grade/Class</label>
                    <input 
                      type="text" 
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Role/Position</label>
                     <select 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-white"
                    >
                      <option value="Member">Member</option>
                      <option value="Captain">Captain</option>
                      <option value="Vice Captain">Vice Captain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Joined Date</label>
                    <input 
                      type="date" 
                      value={formData.joinedDate}
                      onChange={(e) => setFormData({...formData, joinedDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Status</label>
                     <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Injured">Injured</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
               </div>

               {/* Contact Info */}
               <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Emergency Contact</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Parent/Guardian Contact</label>
                    <input 
                      type="text" 
                      value={formData.contactParent}
                      onChange={(e) => setFormData({...formData, contactParent: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                      placeholder="Primary Phone"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700">Emergency Contact Name</label>
                    <input 
                      type="text" 
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Emergency Phone</label>
                    <input 
                      type="text" 
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    />
                  </div>
               </div>

               {/* Coach Info */}
               <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Performance & Notes</h4>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Performance Notes (Coach Only)</label>
                  <textarea 
                    value={formData.performanceNotes || ''}
                    onChange={(e) => setFormData({...formData, performanceNotes: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    rows={3}
                    placeholder="Enter notes about player strengths, areas for improvement, etc."
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Medical Notes</label>
                  <textarea 
                    value={formData.medicalNotes || ''}
                    onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2"
                    rows={2}
                    placeholder="Allergies, past injuries, etc."
                  />
               </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  {isEditing ? 'Update Player' : 'Save Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;