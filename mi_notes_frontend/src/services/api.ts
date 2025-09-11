import axios from 'axios';
import type { AuthResponse, LoginCredentials, Module, Note, RegisterData, User, Exam, CreateExamData, Assignment, CreateAssignmentData, DashboardStats, SemesterStats } from '../types/index';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const moduleService = {
  getAllModules: async (): Promise<Module[]> => {
    console.log('Calling GET /modules endpoint...');
    const response = await api.get('/modules');
    console.log('Raw API response:', response);
    return response.data;
  },
  
  getModulesBySemester: async (semester: number): Promise<Module[]> => {
    const response = await api.get(`/modules/semester/${semester}`);
    return response.data;
  },
  
  getModule: async (id: string): Promise<Module> => {
    const response = await api.get(`/modules/${id}`);
    return response.data;
  },
};

export const noteService = {
  getAllNotes: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },
  
  getNotesByModule: async (moduleId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/module/${moduleId}`);
    return response.data;
  },
  
  getNoteById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  
  uploadNote: async (formData: FormData): Promise<Note> => {
    const response = await api.post('/notes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  downloadNote: async (id: string): Promise<void> => {
    const response = await api.get(`/notes/download/${id}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'note.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  searchNotes: async (query: string): Promise<Note[]> => {
    const response = await api.get(`/notes/search?q=${query}`);
    return response.data;
  },
  
  filterNotes: async (filters: {
    semester?: number;
    moduleId?: string;
    tags?: string[];
  }): Promise<Note[]> => {
    const response = await api.get('/notes/filter', { params: filters });
    return response.data;
  },
};

export const examService = {
  getAllExams: async (): Promise<Exam[]> => {
    const response = await api.get('/exams');
    return response.data;
  },
  
  getExamsByModule: async (moduleId: string): Promise<Exam[]> => {
    const response = await api.get(`/exams/module/${moduleId}`);
    return response.data;
  },
  
  getExamById: async (id: string): Promise<Exam> => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },
  
  createExam: async (examData: CreateExamData): Promise<Exam> => {
    const response = await api.post('/exams', examData);
    return response.data;
  },
  
  updateExam: async (id: string, examData: Partial<CreateExamData>): Promise<Exam> => {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  },
  
  deleteExam: async (id: string): Promise<void> => {
    await api.delete(`/exams/${id}`);
  },
};

export const assignmentService = {
  getAllAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get('/assignments');
    return response.data;
  },
  
  getAssignmentsByModule: async (moduleId: string): Promise<Assignment[]> => {
    const response = await api.get(`/assignments/module/${moduleId}`);
    return response.data;
  },
  
  getAssignmentById: async (id: string): Promise<Assignment> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  
  createAssignment: async (assignmentData: CreateAssignmentData): Promise<Assignment> => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },
  
  updateAssignment: async (id: number, assignmentData: Partial<CreateAssignmentData & { status?: 'Ongoing' | 'Complete' }>): Promise<void> => {
    await api.put(`/assignments/${id}`, assignmentData);
  },
  
  deleteAssignment: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
  
  uploadDocument: async (assignmentId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post(`/assignments/${assignmentId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteDocument: async (assignmentId: number, docId: number): Promise<void> => {
    await api.delete(`/assignments/${assignmentId}/document/${docId}`);
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getSemesterStats: async (semesterId: number): Promise<SemesterStats> => {
    const response = await api.get(`/dashboard/stats/semester/${semesterId}`);
    return response.data;
  },
};

export default api;