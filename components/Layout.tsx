import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Camera,
  Save,
  User
} from 'lucide-react';
import { UserRole } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', password: '', avatarUrl: '' });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleOpenProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name,
        password: user.password,
        avatarUrl: user.avatarUrl || ''
      });
      setShowProfileModal(true);
      setSidebarOpen(false); // Close sidebar on mobile
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({
        ...user,
        name: profileForm.name,
        password: profileForm.password,
        avatarUrl: profileForm.avatarUrl
      });
      setShowProfileModal(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  ];

  if (user?.role !== UserRole.PARENT) {
    navItems.push({ name: 'Teams', path: '/teams', icon: <Users size={20} /> });
  }

  navItems.push({ name: 'Schedule', path: '/schedule', icon: <Calendar size={20} /> });

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Settings size={20} /> });
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:shadow-xl
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Shield className="text-emerald-400" size={28} />
            <span className="text-xl font-bold tracking-tight">Al Munawwara</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <button 
            onClick={handleOpenProfile}
            className="flex items-center mb-4 px-2 w-full text-left hover:bg-slate-800 rounded-lg p-2 transition-colors group"
          >
            <div className="relative">
              <img 
                src={user?.avatarUrl || "https://picsum.photos/40/40"} 
                alt="User" 
                className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-slate-700 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Settings size={10} className="text-white" />
              </div>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </button>
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white shadow-sm lg:hidden">
          <button onClick={toggleSidebar} className="text-slate-600">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Team Manager</h1>
          <div className="w-6"></div> {/* Spacer for balance */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* My Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">My Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                 {/* Avatar Upload */}
                 <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm">
                        {profileForm.avatarUrl ? (
                          <img src={profileForm.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                             <User size={40} />
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition cursor-pointer">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Click icon to change photo</p>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                       <input 
                         type="text" 
                         value={profileForm.name}
                         onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                         required
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                       <input 
                         type="text" 
                         value={profileForm.password}
                         onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                         required
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
                       <input 
                         type="email" 
                         value={user?.email}
                         disabled
                         className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
                       />
                    </div>
                 </div>

                 <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      <Save size={18} className="mr-2" /> Save Profile
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Layout;