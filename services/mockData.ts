import { Team, Player, UserRole, User, TeamCategory, ScheduleEvent, AttendanceRecord } from '../types';

export const MOCK_TEAMS: Team[] = [
  { 
    id: 't1', 
    name: 'Rugby', 
    category: TeamCategory.SPORTS, 
    coaches: [{ name: 'Mr. Silva', role: 'Head Coach', joinedDate: '2020-01-15' }], 
    icon: '🏉' 
  },
  { 
    id: 't2', 
    name: 'Cricket', 
    category: TeamCategory.SPORTS, 
    coaches: [
      { name: 'Mr. Perera', role: 'Head Coach', joinedDate: '2019-05-20' },
      { name: 'Mr. Dilshan', role: 'Assistant Coach', joinedDate: '2021-02-10' }
    ], 
    icon: '🏏' 
  },
  { 
    id: 't3', 
    name: 'Football', 
    category: TeamCategory.SPORTS, 
    coaches: [{ name: 'Mr. Fernando', role: 'Head Coach', joinedDate: '2021-03-10' }], 
    icon: '⚽' 
  },
  { 
    id: 't4', 
    name: 'Kung Fu', 
    category: TeamCategory.SPORTS, 
    coaches: [{ name: 'Master Lee', role: 'Head Coach', joinedDate: '2018-11-01' }], 
    icon: '🥋' 
  },
  { 
    id: 't5', 
    name: 'Badminton', 
    category: TeamCategory.SPORTS, 
    coaches: [{ name: 'Ms. Jayasinghe', role: 'Head Coach', joinedDate: '2022-02-14' }], 
    icon: '🏸' 
  },
  { 
    id: 't6', 
    name: 'Swimming', 
    category: TeamCategory.SPORTS, 
    coaches: [{ name: 'Mr. Dias', role: 'Head Coach', joinedDate: '2020-08-30' }], 
    icon: '🏊' 
  },
  { 
    id: 't7', 
    name: 'Chess', 
    category: TeamCategory.ACTIVITY, 
    coaches: [{ name: 'Mr. Karunaratne', role: 'Head Coach', joinedDate: '2015-06-01' }], 
    icon: '♟️' 
  },
  { 
    id: 't8', 
    name: 'Band', 
    category: TeamCategory.ACTIVITY, 
    coaches: [{ name: 'Mr. Mendis', role: 'Head Coach', joinedDate: '2017-09-15' }], 
    icon: '🎺' 
  },
  { 
    id: 't9', 
    name: 'Scouts', 
    category: TeamCategory.ACTIVITY, 
    coaches: [{ name: 'Mr. Alwis', role: 'Head Coach', joinedDate: '2016-04-22' }], 
    icon: '⚜️' 
  },
];

const generateMockPlayers = (): Player[] => {
  const players: Player[] = [];
  const startYear = 2023;
  
  MOCK_TEAMS.forEach(team => {
    for (let i = 1; i <= 12; i++) {
      players.push({
        id: `p-${team.id}-${i}`,
        teamId: team.id,
        name: `Student ${team.id.toUpperCase()}-${i}`,
        grade: `${10 + (i % 3)}`, // Grades 10-12
        position: i === 1 ? 'Captain' : 'Member',
        contactParent: `077-${Math.floor(1000000 + Math.random() * 9000000)}`,
        
        dob: '2008-05-15',
        joinedDate: `${startYear}-01-10`,
        emergencyContactName: 'Parent Name',
        emergencyContactPhone: `071-${Math.floor(1000000 + Math.random() * 9000000)}`,
        performanceNotes: i === 1 ? 'Excellent leadership skills. consistently improves time.' : '',

        attendanceRate: Math.floor(70 + Math.random() * 30),
        status: Math.random() > 0.9 ? 'Injured' : 'Active',
      });
    }
  });
  return players;
};

export const MOCK_PLAYERS = generateMockPlayers();

const generateCoachUsers = (): User[] => {
  return MOCK_TEAMS.map((team, index) => {
    const headCoachName = team.coaches.find(c => c.role === 'Head Coach')?.name || 'Coach';
    const sportName = team.name;
    
    return {
      id: `u-coach-${team.id}`,
      name: `${headCoachName} (${sportName})`,
      email: `${sportName.toLowerCase().replace(/\s/g, '')}@school.com`,
      password: sportName,
      role: UserRole.COACH,
      assignedTeamId: team.id,
      avatarUrl: `https://picsum.photos/100/100?random=${20 + index}`
    };
  });
};

const samplePlayerId = MOCK_PLAYERS[0].id; // Linking to Rugby Student 1

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Principal Mrs. Wickramasinghe', 
    email: 'principal@school.com', 
    password: '123', 
    role: UserRole.PRINCIPAL, 
    avatarUrl: 'https://picsum.photos/100/100?random=1' 
  },
  { 
    id: 'u2', 
    name: 'Master In-Charge Mr. Gamage', 
    email: 'mic@school.com', 
    password: '123', 
    role: UserRole.MASTER_IN_CHARGE, 
    avatarUrl: 'https://picsum.photos/100/100?random=2' 
  },
  { 
    id: 'u6', 
    name: 'System Admin', 
    email: 'admin@school.com', 
    password: 'Rugby@al', 
    role: UserRole.ADMIN, 
    avatarUrl: 'https://picsum.photos/100/100?random=5' 
  },
  { 
    id: 'u7', 
    name: 'Parent User', 
    email: 'parent@school.com', 
    password: '123', 
    role: UserRole.PARENT, 
    linkedPlayerId: samplePlayerId,
    avatarUrl: 'https://picsum.photos/100/100?random=10' 
  },
  ...generateCoachUsers()
];

export const MOCK_SCHEDULE: ScheduleEvent[] = [
  { id: 'e1', teamId: 't1', title: 'Morning Practice', date: new Date().toISOString().split('T')[0], startTime: '06:00', endTime: '08:00', location: 'School Ground', type: 'Practice' },
  { id: 'e2', teamId: 't2', title: 'Net Practice', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '15:00', endTime: '17:30', location: 'Main Pitch', type: 'Practice' },
  { id: 'e3', teamId: 't3', title: 'Friendly Match', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], startTime: '16:00', endTime: '18:00', location: 'City Stadium', type: 'Match' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', playerId: samplePlayerId, teamId: 't1', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'Present' },
  { id: 'a2', playerId: samplePlayerId, teamId: 't1', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], status: 'Present' },
  { id: 'a3', playerId: samplePlayerId, teamId: 't1', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], status: 'Absent' },
];