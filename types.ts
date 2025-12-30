export enum UserRole {
  PRINCIPAL = 'Principal',
  MASTER_IN_CHARGE = 'Master In-Charge',
  COACH = 'Coach',
  ADMIN = 'Admin',
  PARENT = 'Parent'
}

export enum TeamCategory {
  SPORTS = 'Sports',
  ACTIVITY = 'Activity'
}

export interface AppSettings {
  schoolName: string;
  logoUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  assignedTeamId?: string; // For coaches
  linkedPlayerId?: string; // For parents
  avatarUrl?: string;
}

export interface CoachInfo {
  name: string;
  role: 'Head Coach' | 'Assistant Coach';
  joinedDate: string;
}

export interface Team {
  id: string;
  name: string;
  category: TeamCategory;
  // New: Array of coaches (max 3)
  coaches: CoachInfo[];
  icon: string; // Emoji fallback
  logoUrl?: string; // Custom image
  nextPractice?: string;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  grade: string;
  position: string;
  contactParent: string; 
  
  // New Fields
  photoUrl?: string;
  dob: string;
  joinedDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  performanceNotes?: string;

  medicalNotes?: string;
  attendanceRate: number; // 0-100
  status: 'Active' | 'Injured' | 'Inactive';
}

export interface AttendanceRecord {
  id: string;
  playerId: string;
  teamId: string;
  date: string; // ISO Date string
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export interface ScheduleEvent {
  id: string;
  teamId: string;
  title: string;
  date: string; // ISO Date string
  startTime: string;
  endTime: string;
  location: string;
  type: 'Practice' | 'Match' | 'Meeting';
}

export interface DashboardStats {
  totalPlayers: number;
  activeTeams: number;
  attendanceToday: number;
  upcomingEvents: number;
}