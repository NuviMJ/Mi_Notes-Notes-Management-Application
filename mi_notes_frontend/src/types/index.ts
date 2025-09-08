export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  moduleName: string;
  semester: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: User;
  uploadedAt: string;
  downloads: number;
  tags: string[];
}

export interface Module {
  id: string;
  name: string;
  code: string;
  semester: number;
  description?: string;
  credits?: number;
  noteCount?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}