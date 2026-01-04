import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { generateAttendanceInsights } from '../services/geminiService';
import { UserRole, Player } from '../types';
import AttendanceTaker from '../components/AttendanceTaker';
import PlayerAttendanceCalendar from '../components/PlayerAttendanceCalendar';
import { 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  Loader2,
  UserCheck,
  ShieldAlert,
  Search,
  User as UserIcon,
  ChevronDown,
  Clock,
  MapPin,
  Heart
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
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Attendance Tracker State
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  const selectedPlayer = useMemo(() => 
    players.find(p => p.id === selectedPlayerId),
    [players, selectedPlayerId]
  );

  // --- PARENT VIEW LOGIC ---
  if (user?.role === UserRole.PARENT) {
    const myChild = players.find(p => p.id === user.linkedPlayerId);
    if (!myChild) return <div className="p-8 text-slate-500 italic">No student linked to this account.</div>;

    const myTeam = teams.find(t => t.id === myChild.teamId);
    const mySchedule = schedule
      .filter(e => e.teamId === myChild.teamId && new Date(e.date) >= new Date())
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name}</h1>
                <p className="text-slate-500 mt-1">Activity summary for <span className="font-semibold text-emerald-600">{myChild.name}</span></p>
              </div>
              <div className="mt-4 md:mt-0 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center">
                 <Trophy className="text-emerald-500 mr-2" size={20} />
                 <span className="font-bold text-slate-800">{myTeam?.name} Team</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Quick Stats for Parent */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Child Stats</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><TrendingUp size={16} className="mr-2 text-emerald-500"/> Attendance</span>
                    <span className="text-lg font-bold text-emerald-600">{myChild.attendanceRate}%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><Heart size={16} className="mr-2 text-red-500"/> Health Status</span>
                    <span className={`text-sm font-bold ${myChild.status === 'Injured' ? 'text-red-500' : 'text-emerald-600'}`}>
                      {myChild.status}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><Calendar size={16} className="mr-2 text-blue-500"/> Grade</span>
                    <span className="text-lg font-bold">{myChild.grade}</span>
                 </div>
              </div>
           </div>

           {/* Next Practice Card for Parent */}
           <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Upcoming Schedule</h3>
              <div className="space-y-3">
                 {mySchedule.length === 0 && <p className="text-slate-400 italic text-sm">No upcoming events for this team.</p>}
                 {mySchedule.slice(0, 2).map(event => (
                   <div key={event.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center space-x-4">
                         <div className="bg-white/20 p-2 rounded text-xl">{myTeam?.icon}</div>
                         <div>
                            <div className="font-bold text-sm sm:text-base">{event.title}</div>
                            <div className="text-xs text-indigo-200">{event.date} @ {event.startTime}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] sm:text-xs font-semibold bg-indigo-500/30 text-indigo-300 px-2 py-1 rounded mb-1">
                            {event.type}
                         </div>
                         <div className="text-[10px] text-slate-400 flex items-center justify-end">
                            <MapPin size={10} className="mr-1" /> {event.location}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Individual Calendar for Parent */}
        <div className="grid grid-cols-1 gap-6">
           <PlayerAttendanceCalendar player={myChild} />
        </div>
      </div>
    );
  }

  // --- COACH VIEW LOGIC ---
  if (user?.role === UserRole.COACH) {
    const myTeam = teams.find(t => t.id === user.assignedTeamId);
    if (!myTeam) return <div className="p-8">No team assigned to this coach account.</div>;

    const myPlayers = players.filter(p => p.teamId === myTeam.id);
    const injuredCount = myPlayers.filter(p => p.status === 'Injured').length;
    const avgAttendance = Math.round(myPlayers.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (myPlayers.length || 1));
    
    const mySchedule = schedule
      .filter(e => e.teamId === myTeam.id && new Date(e.date) >= new Date())
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="space-y-6 pb-12">
        {/* Attendance Modal */}
        {showAttendanceModal && (
          <AttendanceTaker teamId={myTeam.id} onClose={() => setShowAttendanceModal(false)} />
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Coach Command Center</h1>
                <p className="text-slate-500 mt-1">Managing <span className="font-semibold text-emerald-600">{myTeam.name} Team</span></p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                 <button 
                   onClick={() => setShowAttendanceModal(true)}
                   className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition transform hover:scale-105 active:scale-95 font-bold"
                 >
                   <UserCheck size={20} className="mr-2 text-emerald-400" /> Mark Today's Attendance
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><Users size={16} className="mr-2"/> Total Roster</span>
                    <span className="text-lg font-bold">{myPlayers.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><ShieldAlert size={16} className="mr-2 text-red-500"/> Injured</span>
                    <span className="text-lg font-bold text-red-500">{injuredCount}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><TrendingUp size={16} className="mr-2 text-emerald-500"/> Avg. Attendance</span>
                    <span className="text-lg font-bold text-emerald-600">{avgAttendance}%</span>
                 </div>
              </div>
           </div>

           <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Upcoming Schedule</h3>
              <div className="space-y-3">
                 {mySchedule.length === 0 && <p className="text-slate-400 italic text-sm">No upcoming events found.</p>}
                 {mySchedule.slice(0, 2).map(event => (
                   <div key={event.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer">
                      <div className="flex items-center space-x-4">
                         <div className="bg-white/20 p-2 rounded text-xl">{myTeam.icon}</div>
                         <div>
                            <div className="font-bold text-sm sm:text-base">{event.title}</div>
                            <div className="text-xs text-slate-300">{event.date} @ {event.startTime}</div>
                         </div>
                      </div>
                      <div className="text-[10px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                         {event.type}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Player Selection & Individual Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <Users size={18} className="mr-2 text-slate-400" /> Select Player
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {myPlayers.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`w-full flex items-center p-3 rounded-lg border transition-all text-left ${
                    selectedPlayerId === p.id 
                      ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-100 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${selectedPlayerId === p.id ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{p.position} • Grade {p.grade}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPlayer ? (
              <PlayerAttendanceCalendar player={selectedPlayer} />
            ) : (
              <div className="h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center">
                <Calendar className="text-slate-300 mb-4" size={48} />
                <h4 className="text-slate-500 font-bold">Player Deep Dive</h4>
                <p className="text-slate-400 text-sm max-w-xs">Select a student from the list to view their individual attendance calendar and participation history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Table Quick View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Team Roster Summary</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                       <th className="px-6 py-3">Student Name</th>
                       <th className="px-6 py-3">Position</th>
                       <th className="px-6 py-3">Attendance</th>
                       <th className="px-6 py-3">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {myPlayers.slice(0, 5).map(p => (
                       <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-900">{p.name}</td>
                          <td className="px-6 py-3 text-slate-600">{p.position}</td>
                          <td className="px-6 py-3">
                             <div className="flex items-center">
                                <div className="w-16 bg-slate-100 h-1.5 rounded-full mr-2 overflow-hidden">
                                   <div className="bg-emerald-500 h-full" style={{width: `${p.attendanceRate}%`}}></div>
                                </div>
                                <span>{p.attendanceRate}%</span>
                             </div>
                          </td>
                          <td className="px-6 py-3">
                             <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {p.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  }

  // --- SCHOOL ADMIN / MIC / PRINCIPAL VIEW ---

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

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
    teams.find(t => t.id === p.teamId)?.name.toLowerCase().includes(playerSearchQuery.toLowerCase())
  ).slice(0, 15);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">School-wide sports & activity management dashboard.</p>
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
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-indigo-900 text-sm leading-relaxed shadow-sm">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Participation Rates (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceByTeam}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Player Health Status</h3>
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
              <div key={entry.name} className="flex items-center text-[10px] sm:text-xs">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Individual Attendance Checker */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center mb-4 md:mb-0">
               <UserIcon className="mr-2 text-indigo-600" /> Student Attendance Audit
            </h2>
            <div className="relative w-full md:w-72">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="Search student by name or team..."
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
               />
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 border rounded-lg overflow-hidden">
               <div className="bg-slate-50 p-3 border-b text-xs font-bold text-slate-500 uppercase">Search Results</div>
               <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                  {filteredPlayers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic">No students found.</div>
                  ) : (
                    filteredPlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlayerId(p.id)}
                        className={`w-full flex items-center p-3 text-left transition-colors ${
                          selectedPlayerId === p.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 mr-3 flex-shrink-0 flex items-center justify-center font-bold text-slate-600">
                           {p.name.charAt(0)}
                        </div>
                        <div>
                           <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                           <div className="text-xs text-slate-500">{teams.find(t => t.id === p.teamId)?.name}</div>
                        </div>
                      </button>
                    ))
                  )}
               </div>
            </div>

            <div className="lg:col-span-2">
               {selectedPlayer ? (
                 <PlayerAttendanceCalendar player={selectedPlayer} />
               ) : (
                 <div className="h-full border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
                    <Calendar className="text-slate-200 mb-4" size={64} />
                    <h3 className="text-lg font-bold text-slate-400">Select a Student to Begin Audit</h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-sm">Use the search bar and student list to deep-dive into individual participation logs and calendar view.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;