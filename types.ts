
export enum UserRole {
  Admin = 'admin',
  Monitor = 'monitor',
  Student = 'student',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO 8601 string
  createdBy: string; // User ID
  attachmentFilename?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  filename: string;
  emailMessageId?: string; // a mock path
  uploadedAt: string; // ISO 8601 string
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface AdminStats {
  totalUsers: number;
  pendingUsers: number;
  assignmentsCount: number;
  submissionsCount: number;
}

export interface MonitorStats {
  assignmentsCreated: number;
  totalSubmissions: number;
  pendingAssignments: number;
}

export interface StudentStats {
  assignmentsAvailable: number;
  assignmentsSubmitted: number;
  assignmentsPending: number;
  nextDeadline: string | null;
}