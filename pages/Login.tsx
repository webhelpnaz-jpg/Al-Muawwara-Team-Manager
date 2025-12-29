import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, AlertCircle, Copy } from 'lucide-react';
import { MOCK_USERS } from '../services/mockData';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const copyToClipboard = (text: string) => {
    setEmail(text);
    setPassword('123'); // Most demos use this
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <Shield className="mx-auto text-emerald-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-white tracking-tight">Al Munawwara Teams</h1>
        <p className="text-slate-400 mt-2">Sign in to manage sports and activities</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
           <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Sign In
              </button>
           </form>
        </div>
        
        {/* Credentials Cheat Sheet */}
        <div className="bg-slate-50 p-6 border-t border-slate-100">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Available Logins (Click to fill)</h3>
           <div className="space-y-2">
             {MOCK_USERS.map(user => (
               <button
                 key={user.id}
                 onClick={() => {
                   setEmail(user.email);
                   setPassword(user.password);
                   setError('');
                 }}
                 className="w-full flex items-center justify-between p-2 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-left transition-all group"
               >
                 <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                    <div>
                       <div className="text-sm font-semibold text-slate-700">{user.role}</div>
                       <div className="text-xs text-slate-500">{user.email} / {user.password}</div>
                    </div>
                 </div>
                 <Copy size={14} className="text-slate-300 group-hover:text-emerald-500" />
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;