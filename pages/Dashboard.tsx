import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { generateAttendanceInsights } from '../services/geminiService';
import { UserRole } from '../types';
import { 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { players, teams, attendance, schedule } = useData();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // --- PARENT VIEW LOGIC ---
  if (user?.role === UserRole.PARENT) {
    const child = players.find(p => p.id === user.linkedPlayerId);
    if (!child) return <div className="p-8">No student linked to this parent account.</div>;

    const childTeam = teams.find(t => t.id === child.teamId);
    const childAttendance = attendance
      .filter(a => a.playerId === child.id)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    const nextEvent = schedule
      .filter(e => e.teamId === child.teamId && new Date(e.date) >= new Date())
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name}</h1>
                <p className="text-slate-500 mt-1">Here is the activity summary for <span className="font-semibold text-slate-800">{child.name}</span></p>
              </div>
              <div className="text-4xl">{childTeam?.icon}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Attendance Stats */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-emerald-500" /> Attendance Overview
              </h3>
              <div className="text-center py-6">
                 <div className="text-5xl font-bold text-slate-800 mb-2">{child.attendanceRate}%</div>
                 <p className="text-slate-500 text-sm">Overall Attendance Rate</p>
              </div>
              <div className="space-y-3">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h4>
                 {childAttendance.length === 0 && <p className="text-sm text-slate-400 italic">No records yet.</p>}
                 {childAttendance.map(record => (
                   <div key={record.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                      <span className="text-slate-600">{record.date}</span>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-semibold
                        ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {record.status}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Next Practice */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-500" /> Next Practice
              </h3>
              {nextEvent ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm font-bold text-blue-600 uppercase mb-2">{nextEvent.type}</div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{nextEvent.title}</div>
                    <div className="text-lg text-slate-600 mb-4">{new Date(nextEvent.date).toLocaleDateString()}</div>
                    <div className="flex items-center text-slate-500 space-x-4">
                       <span className="flex items-center"><Clock size={16} className="mr-1"/> {nextEvent.startTime}</span>
                       <span className="flex items-center">@ {nextEvent.location}</span>
                    </div>
                </div>
              ) : (
                <div className="flex-1 flex justify-center items-center text-slate-500 italic">
                  No upcoming practices scheduled.
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // --- SCHOOL ADMIN / COACH VIEW ---

  // Stats Calculation
  const totalPlayers = players.length;
  const activeTeams = teams.length;
  const today = new Date().toISOString().split('T')[0];
  const attendanceToday = attendance.filter(a => a.date === today && a.status === 'Present').length;
  const upcomingEvents = schedule.filter(e => e.date >= today).length;

  const stats = { totalPlayers, activeTeams, attendanceToday, upcomingEvents };

  // Chart Data Preparation
  const attendanceByTeam = teams.map(team => {
    const teamPlayers = players.filter(p => p.teamId === team.id);
    const avgRate = teamPlayers.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (teamPlayers.length || 1);
    return { name: team.name, attendance: Math.round(avgRate) };
  }).sort((a,b) => b.attendance - a.attendance).slice(0, 5);

  const statusDistribution = [
    { name: 'Active', value: players.filter(p => p.status === 'Active').length },
    { name: 'Injured', value: players.filter(p => p.status === 'Injured').length },
    { name: 'Inactive', value: players.filter(p => p.status === 'Inactive').length },
  ];

  const handleGetInsights = async () => {
    setLoadingInsight(true);
    const result = await generateAttendanceInsights(stats, teams.slice(0,3));
    setInsight(result);
    setLoadingInsight(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
      <div className={`p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">Here's what's happening with your teams today.</p>
        </div>
        <button 
          onClick={handleGetInsights}
          disabled={loadingInsight}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loadingInsight ? <Loader2 className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18}/>}
          {insight ? 'Refresh AI Insights' : 'Get AI Insights'}
        </button>
      </div>

      {insight && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-indigo-900 text-sm leading-relaxed">
          <strong>AI Analysis:</strong> {insight}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Players" value={totalPlayers} icon={Users} color="text-emerald-600 bg-emerald-600" />
        <StatCard title="Active Teams" value={activeTeams} icon={Trophy} color="text-blue-600 bg-blue-600" />
        <StatCard title="Checked In Today" value={attendanceToday} icon={TrendingUp} color="text-orange-600 bg-orange-600" />
        <StatCard title="Upcoming Events" value={upcomingEvents} icon={Calendar} color="text-purple-600 bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Attendance Rates (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceByTeam}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Player Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Player Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-2">
            {statusDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;