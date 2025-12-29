import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS } from '../services/mockData';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <Shield className="mx-auto text-emerald-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold text-white tracking-tight">Al Munawwara Teams</h1>
        <p className="text-slate-400 mt-2">Sign in to manage sports and activities</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4 text-center">Select a Role to Demo</h2>
        <div className="space-y-3">
          {MOCK_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => login(user.id)}
              className="w-full flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-emerald-400 transition-all group"
            >
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full mr-4" />
              <div className="text-left">
                <p className="font-semibold text-slate-900 group-hover:text-emerald-700">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-400">
          This is a demo environment. No password required.
        </div>
      </div>
    </div>
  );
};

export default Login;