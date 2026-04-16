export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type TaskStatus = 'TODO' | 'DOING' | 'RESOLVED' | 'CLOSE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  reporter?: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  fullName: string;
}
