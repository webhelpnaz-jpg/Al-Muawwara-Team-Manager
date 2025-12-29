import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle, ExternalLink, ChevronDown, User as UserIcon } from 'lucide-react';
import { MOCK_USERS } from '../services/mockData';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login, forgotPassword, usersList } = useAuth(); // Using usersList from context to get latest state
  
  // Views: 'login' | 'forgot' | 'sent'
  const [view, setView] = useState<'login' | 'forgot' | 'sent'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API delay
    setTimeout(() => {
        const sent = forgotPassword(email);
        if (sent) {
            setView('sent');
            setError('');
        } else {
            setError('Email address not found.');
        }
    }, 800);
  };

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  // Helper to fill credentials
  const fillCredentials = (uEmail: string, uPass: string) => {
    setEmail(uEmail);
    setPassword(uPass);
    setError('');
    setView('login');
  };

  const managementUsers = usersList.filter(u => 
    u.role === UserRole.ADMIN || 
    u.role === UserRole.PRINCIPAL || 
    u.role === UserRole.MASTER_IN_CHARGE
  );

  const coachUsers = usersList.filter(u => u.role === UserRole.COACH);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <Shield className="mx-auto text-emerald-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-white tracking-tight">Al Munawwara Teams</h1>
        <p className="text-slate-400 mt-2">Sign in to manage sports and activities</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* LOGIN VIEW */}
        {view === 'login' && (
            <div className="p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
                {error && (
                    <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="name@school.com"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="••••••••"
                    />
                    </div>
                    <div className="flex justify-end mt-1">
                        <button 
                            type="button" 
                            onClick={() => { setView('forgot'); setError(''); }}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Forgot password?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                    Sign In
                </button>
            </form>
            </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
             <div className="p-8">
                <button 
                    onClick={() => { setView('login'); setError(''); }}
                    className="flex items-center text-slate-500 hover:text-slate-800 text-sm mb-6"
                >
                    <ArrowLeft size={16} className="mr-1"/> Back to Login
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-2">Reset Password</h2>
                <p className="text-slate-500 text-sm mb-6">Enter your registered email address and we'll send you a link to reset your password.</p>

                <form onSubmit={handleForgotSubmit} className="space-y-6">
                    {error && (
                        <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        <AlertCircle size={16} className="mr-2" />
                        {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="name@school.com"
                        />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                        Send Reset Link
                    </button>
                </form>
             </div>
        )}

        {/* SENT CONFIRMATION VIEW */}
        {view === 'sent' && (
            <div className="p-8 text-center">
                 <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-emerald-600" size={32} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
                 <p className="text-slate-500 text-sm mb-6">
                    We have sent a password reset link to <br/>
                    <span className="font-semibold text-slate-700">{email}</span>
                 </p>
                 
                 <div className="space-y-3">
                    <button
                        onClick={openGmail}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                        <ExternalLink size={16} className="mr-2" /> Open Gmail
                    </button>
                    <button
                        onClick={() => setView('login')}
                        className="w-full flex justify-center py-2.5 px-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                        Back to Login
                    </button>
                 </div>
            </div>
        )}
        
        {/* Credentials Cheat Sheet (Updated) */}
        <div className="bg-slate-50 p-6 border-t border-slate-100">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Fill (Development Mode)</h3>
           
           <div className="grid grid-cols-1 gap-4">
              {/* Management Logins */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Administration</h4>
                <div className="space-y-2">
                  {managementUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => fillCredentials(u.email, u.password)}
                      className="w-full flex items-center justify-between p-2 rounded bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm text-left transition-all"
                    >
                      <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${u.role === 'Admin' ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                          <span className="text-sm font-medium text-slate-700">{u.role}</span>
                      </div>
                      <span className="text-xs text-slate-400">{u.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coach Dropdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Team Coaches</h4>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <UserIcon size={16} className="text-slate-400" />
                   </div>
                   <select 
                     className="block w-full pl-10 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
                     onChange={(e) => {
                       const selectedUser = coachUsers.find(u => u.id === e.target.value);
                       if (selectedUser) {
                         fillCredentials(selectedUser.email, selectedUser.password);
                       }
                     }}
                     defaultValue=""
                   >
                     <option value="" disabled>Select a Sport...</option>
                     {coachUsers.map(u => (
                       <option key={u.id} value={u.id}>
                          {u.email.split('@')[0].toUpperCase()} Coach
                       </option>
                     ))}
                   </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     <ChevronDown size={16} className="text-slate-400" />
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;