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

export interface Exam {
  exam_id: string;
  module_id: string;
  exam_name: string;
  exam_date: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'assignment';
  created_at?: string;
  updated_at?: string;
  module?: Module;
}

export interface CreateExamData {
  module_id: string;
  exam_name: string;
  exam_date: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'assignment';
}