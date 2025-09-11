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

export interface AssignmentDocument {
  doc_id: number;
  doc_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

export interface Assignment {
  assignment_id: number;
  module_id: number;
  title: string;
  deadline: string;
  status: 'Ongoing' | 'Complete';
  module_name?: string;
  module_code?: string;
  documents: AssignmentDocument[];
}

export interface CreateAssignmentData {
  module_id: number;
  title: string;
  deadline: string;
}

export interface DashboardStats {
  totalNotes: number;
  totalUsers: number;
  totalModules: number;
  totalSemesters: number;
  totalAssignments: number;
  ongoingAssignments: number;
  completedAssignments: number;
  totalExams: number;
  notesBySemester: Array<{
    semester_name: string;
    semester_id: number;
    notes_count: number;
  }>;
  topModules: Array<{
    module_name: string;
    code: string;
    note_count: number;
  }>;
  recentActivity: Array<{
    title: string;
    upload_date: string;
    module_name: string;
    uploaded_by: string;
  }>;
  assignmentStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface SemesterStats {
  moduleCount: number;
  noteCount: number;
  assignmentCount: number;
  examCount: number;
}