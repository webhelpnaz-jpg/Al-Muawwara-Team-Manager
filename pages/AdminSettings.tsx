import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, User } from '../types';
import { Shield, Key, Search, User as UserIcon, Edit2, X, Save } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user, usersList, adminResetPassword, updateUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Reset Password Modal
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');

  // State for Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (user?.role !== UserRole.ADMIN) {
    return <div className="p-8">Access Denied</div>;
  }

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
       <div className="flex items-center space-x-3 mb-6">
         <div className="p-3 bg-red-100 rounded-full text-red-600">
           <Shield size={24} />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
            <p className="text-slate-500">System user management and security controls.</p>
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
                        <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full mr-3 bg-slate-200" />
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
                  
                  {/* Note: Role editing could be added here, but prompt focused on Names/Details */}
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