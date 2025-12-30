import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { UserRole, User } from '../types';
import { Shield, Key, Search, User as UserIcon, Edit2, X, Save, Camera, Trash2, Building } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user, usersList, adminResetPassword, updateUser } = useAuth();
  const { appSettings, updateAppSettings } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Reset Password Modal
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');

  // State for Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // State for School Settings
  const [schoolName, setSchoolName] = useState(appSettings.schoolName);
  const [schoolLogo, setSchoolLogo] = useState(appSettings.logoUrl);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Sync state if context changes
  useEffect(() => {
    setSchoolName(appSettings.schoolName);
    setSchoolLogo(appSettings.logoUrl);
  }, [appSettings]);

  if (user?.role !== UserRole.ADMIN) {
    return <div className="p-8">Access Denied</div>;
  }

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- School Settings Handlers ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings({
      schoolName: schoolName,
      logoUrl: schoolLogo
    });
    setSettingsMsg('School settings updated successfully!');
    setTimeout(() => setSettingsMsg(''), 3000);
  };

  const handleRemoveLogo = () => {
      setSchoolLogo('');
  };

  // --- Reset Password Handlers ---
  const handleOpenReset = (userId: string) => {
    setResetUserId(userId);
    setNewPassword('');
    setConfirmPassword('');
    setMsg('');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    if (resetUserId) {
      adminResetPassword(resetUserId, newPassword);
      setMsg('Password updated successfully.');
      setTimeout(() => setResetUserId(null), 1000);
    }
  };

  // --- Edit User Handlers ---
  const handleOpenEdit = (userToEdit: User) => {
    setEditingUser({ ...userToEdit });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser);
      setEditingUser(null);
    }
  };

  const handleUserAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingUser({ ...editingUser, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveUserAvatar = () => {
    if (editingUser) {
        setEditingUser({ ...editingUser, avatarUrl: '' });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-6">
         <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <Shield size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
                <p className="text-slate-500">System user management and security controls.</p>
            </div>
         </div>
       </div>

       {/* School Identity Settings */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
           <div className="p-4 border-b border-slate-200">
               <h2 className="text-lg font-bold text-slate-800 flex items-center">
                   <Building className="mr-2" size={20} /> School Identity
               </h2>
           </div>
           <div className="p-6">
               <form onSubmit={handleSaveSettings} className="flex flex-col md:flex-row gap-8 items-start">
                   {/* Logo Upload */}
                   <div className="flex flex-col items-center">
                       <label className="block text-sm font-medium text-slate-700 mb-2">School Logo</label>
                       <div className="relative group">
                           <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                               {schoolLogo ? (
                                   <img src={schoolLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                               ) : (
                                   <Shield size={48} className="text-slate-300" />
                               )}
                           </div>
                           <label className="absolute bottom-2 right-2 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 shadow-md">
                               <Camera size={16} />
                               <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                           </label>
                       </div>
                       {schoolLogo && (
                           <button 
                               type="button" 
                               onClick={handleRemoveLogo}
                               className="text-xs text-red-500 mt-2 hover:underline flex items-center"
                           >
                               <Trash2 size={12} className="mr-1" /> Remove Logo
                           </button>
                       )}
                   </div>

                   {/* School Name Input */}
                   <div className="flex-1 w-full space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                           <input 
                               type="text" 
                               value={schoolName}
                               onChange={(e) => setSchoolName(e.target.value)}
                               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                               placeholder="Enter School Name"
                           />
                           <p className="text-xs text-slate-500 mt-1">This name will appear on the Login screen and Sidebar.</p>
                       </div>
                       
                       <div className="flex items-center justify-between pt-2">
                           {settingsMsg && <span className="text-sm text-emerald-600 font-medium">{settingsMsg}</span>}
                           {!settingsMsg && <span></span>} {/* Spacer */}
                           <button 
                               type="submit" 
                               className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center"
                           >
                               <Save size={18} className="mr-2" /> Save Settings
                           </button>
                       </div>
                   </div>
               </form>
           </div>
       </div>

       {/* User Management */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center">
               <UserIcon className="mr-2" size={20} /> User Accounts
             </h2>
             <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Current Password (Mock)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img src={u.avatarUrl || "https://picsum.photos/40/40"} alt="" className="w-8 h-8 rounded-full mr-3 bg-slate-200 object-cover" />
                        <div>
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-slate-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${u.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' : 
                          u.role === UserRole.PRINCIPAL ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {/* Only showing for demo purposes as requested */}
                      {u.password}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end space-x-3">
                          <button 
                             onClick={() => handleOpenEdit(u)}
                             className="text-slate-500 hover:text-emerald-600 font-medium flex items-center"
                             title="Edit Details"
                          >
                             <Edit2 size={16} />
                          </button>
                          <button 
                             onClick={() => handleOpenReset(u.id)}
                             className="text-slate-500 hover:text-red-600 font-medium flex items-center"
                             title="Reset Password"
                          >
                             <Key size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>

       {/* Edit User Modal */}
       {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-900">Edit User Details</h3>
                 <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={handleEditSubmit} className="space-y-4">
                  {/* Avatar Upload for Admin */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                        <img 
                            src={editingUser.avatarUrl || "https://picsum.photos/100/100"} 
                            alt="Avatar" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-slate-100" 
                        />
                        <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-emerald-700">
                            <Camera size={12} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleUserAvatarUpload} />
                        </label>
                    </div>
                    {editingUser.avatarUrl && (
                        <button 
                            type="button" 
                            onClick={handleRemoveUserAvatar}
                            className="text-xs text-red-500 mt-2 hover:underline"
                        >
                            Remove Photo
                        </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                       type="text" 
                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                       value={editingUser.name}
                       onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                       required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                       type="email" 
                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                       value={editingUser.email}
                       onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                       required
                    />
                  </div>
                  
                  <div className="text-xs text-slate-500 pt-2">
                     Role: <span className="font-semibold">{editingUser.role}</span>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
                    >
                      <Save size={16} className="mr-2" /> Save Changes
                    </button>
                  </div>
               </form>
            </div>
         </div>
       )}

       {/* Reset Password Modal */}
       {resetUserId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
               <h3 className="text-lg font-bold text-slate-900 mb-4">Reset Password</h3>
               <p className="text-sm text-slate-500 mb-4">
                 Set a new password for <span className="font-semibold text-slate-800">{usersList.find(u => u.id === resetUserId)?.name}</span>.
               </p>
               
               <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <input 
                       type="text" 
                       placeholder="New Password"
                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                       value={newPassword}
                       onChange={e => setNewPassword(e.target.value)}
                       required
                    />
                  </div>
                  <div>
                    <input 
                       type="text" 
                       placeholder="Confirm Password"
                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                       value={confirmPassword}
                       onChange={e => setConfirmPassword(e.target.value)}
                       required
                    />
                  </div>
                  
                  {msg && (
                    <div className={`text-sm ${msg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {msg}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setResetUserId(null)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Set Password
                    </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

export default AdminSettings;