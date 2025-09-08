import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Paperclip,
  Download,
  Trash2,
  Eye,
  Plus,
  FolderOpen
} from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: 'ongoing' | 'completed' | 'overdue';
  description?: string;
  attachedFile?: {
    name: string;
    size: string;
    uploadDate: string;
  };
  grade?: string;
  submittedDate?: string;
}

const AssignmentsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample assignments data - replace with actual data from API
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 1,
      title: 'Data Structures Lab Report',
      subject: 'Data Structures',
      dueDate: '2025-01-20',
      status: 'ongoing',
      description: 'Implement and analyze different sorting algorithms',
    },
    {
      id: 2,
      title: 'Database Design Project',
      subject: 'Database Systems',
      dueDate: '2025-01-25',
      status: 'ongoing',
      description: 'Design a database schema for an e-commerce platform',
      attachedFile: {
        name: 'database_schema_v1.pdf',
        size: '2.4 MB',
        uploadDate: '2025-01-10'
      }
    },
    {
      id: 3,
      title: 'Web App Development',
      subject: 'Web Development',
      dueDate: '2025-01-15',
      status: 'overdue',
      description: 'Create a responsive web application using React',
    },
    {
      id: 4,
      title: 'OS Process Scheduling',
      subject: 'Operating Systems',
      dueDate: '2024-12-20',
      status: 'completed',
      description: 'Implement different CPU scheduling algorithms',
      attachedFile: {
        name: 'os_assignment.pdf',
        size: '1.8 MB',
        uploadDate: '2024-12-19'
      },
      grade: 'A',
      submittedDate: '2024-12-19'
    },
    {
      id: 5,
      title: 'Network Protocol Analysis',
      subject: 'Computer Networks',
      dueDate: '2024-12-15',
      status: 'completed',
      description: 'Analyze TCP/IP protocols using Wireshark',
      attachedFile: {
        name: 'network_analysis.docx',
        size: '3.2 MB',
        uploadDate: '2024-12-14'
      },
      grade: 'A+',
      submittedDate: '2024-12-14'
    }
  ]);

  const ongoingAssignments = assignments.filter(a => a.status === 'ongoing' || a.status === 'overdue');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, assignmentId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      // Update assignment with file info
      setAssignments(prev => prev.map(assignment => {
        if (assignment.id === assignmentId) {
          return {
            ...assignment,
            attachedFile: {
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              uploadDate: new Date().toISOString().split('T')[0]
            }
          };
        }
        return assignment;
      }));
      setUploadingFor(null);
    }
  };

  const handleDeleteFile = (assignmentId: number) => {
    setAssignments(prev => prev.map(assignment => {
      if (assignment.id === assignmentId) {
        const { attachedFile, ...rest } = assignment;
        return rest;
      }
      return assignment;
    }));
  };

  const handleCompleteAssignment = (assignmentId: number) => {
    setAssignments(prev => prev.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          status: 'completed' as const,
          submittedDate: new Date().toISOString().split('T')[0]
        };
      }
      return assignment;
    }));
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (status: string, dueDate?: string) => {
    if (status === 'completed') return 'text-green-600 bg-green-100 border-green-300';
    if (status === 'overdue') return 'text-red-600 bg-red-100 border-red-300';
    
    const daysLeft = dueDate ? getDaysRemaining(dueDate) : 999;
    if (daysLeft <= 3) return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-palette-600 bg-palette-100 border-palette-300';
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const daysLeft = getDaysRemaining(assignment.dueDate);
    const isOverdue = daysLeft < 0 && assignment.status !== 'completed';
    
    return (
      <div 
        key={assignment.id}
        className="bg-palette-white rounded-lg border border-palette-300/50 p-5 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-palette-800 mb-1">{assignment.title}</h4>
            <p className="text-sm text-palette-600">{assignment.subject}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status, assignment.dueDate)}`}>
            {assignment.status === 'completed' ? 'COMPLETED' :
             isOverdue ? 'OVERDUE' :
             'ONGOING'}
          </span>
        </div>

        {assignment.description && (
          <p className="text-sm text-palette-700 mb-3 line-clamp-2">{assignment.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-palette-600 mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
          {assignment.status !== 'completed' && (
            <span className={`font-semibold ${
              daysLeft < 0 ? 'text-red-600' :
              daysLeft <= 3 ? 'text-orange-600' :
              'text-palette-600'
            }`}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
               daysLeft === 0 ? 'Due today' :
               daysLeft === 1 ? 'Due tomorrow' :
               `${daysLeft} days left`}
            </span>
          )}
          {assignment.status === 'completed' && assignment.grade && (
            <span className="font-semibold text-green-600">Grade: {assignment.grade}</span>
          )}
        </div>

        {/* File Attachment Section */}
        <div className="border-t border-palette-200 pt-3">
          {assignment.attachedFile ? (
            <div className="flex items-center justify-between bg-palette-100/50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-palette-600" />
                <div>
                  <p className="text-sm font-medium text-palette-700">{assignment.attachedFile.name}</p>
                  <p className="text-xs text-palette-500">
                    {assignment.attachedFile.size} • Uploaded {assignment.attachedFile.uploadDate}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-2 hover:bg-palette-200 rounded-lg transition-colors"
                  title="View file"
                >
                  <Eye className="h-4 w-4 text-palette-600" />
                </button>
                <button 
                  className="p-2 hover:bg-palette-200 rounded-lg transition-colors"
                  title="Download file"
                >
                  <Download className="h-4 w-4 text-palette-600" />
                </button>
                {assignment.status !== 'completed' && (
                  <button 
                    onClick={() => handleDeleteFile(assignment.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ) : assignment.status !== 'completed' ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-palette-500">No file attached</p>
              <input
                ref={uploadingFor === assignment.id ? fileInputRef : null}
                type="file"
                id={`file-upload-${assignment.id}`}
                className="hidden"
                onChange={(e) => handleFileUpload(e, assignment.id)}
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              />
              <button
                onClick={() => {
                  setUploadingFor(assignment.id);
                  document.getElementById(`file-upload-${assignment.id}`)?.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-palette-600 text-white rounded-lg hover:bg-palette-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </button>
            </div>
          ) : (
            <p className="text-sm text-palette-500 italic">Submitted on {assignment.submittedDate}</p>
          )}
        </div>

        {/* Action Buttons */}
        {assignment.status !== 'completed' && assignment.attachedFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleCompleteAssignment(assignment.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-palette-100 to-palette-300/50 rounded-xl shadow-lg p-6 my-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-palette-700 mr-3" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900">
            Assignments Manager
          </h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-palette-700 text-white rounded-lg hover:bg-palette-800 transition-colors">
          <Plus className="h-5 w-5" />
          Add Assignment
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-palette-300">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`pb-3 px-4 font-semibold transition-colors relative ${
            activeTab === 'ongoing' 
              ? 'text-palette-700' 
              : 'text-palette-500 hover:text-palette-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ongoing Assignments
            <span className="bg-palette-600 text-white text-xs px-2 py-1 rounded-full">
              {ongoingAssignments.length}
            </span>
          </div>
          {activeTab === 'ongoing' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-700"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 font-semibold transition-colors relative ${
            activeTab === 'completed' 
              ? 'text-palette-700' 
              : 'text-palette-500 hover:text-palette-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Completed Assignments
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              {completedAssignments.length}
            </span>
          </div>
          {activeTab === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-700"></div>
          )}
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'ongoing' ? (
          ongoingAssignments.length > 0 ? (
            ongoingAssignments.map(renderAssignmentCard)
          ) : (
            <div className="col-span-2 text-center py-12">
              <FolderOpen className="h-16 w-16 text-palette-400 mx-auto mb-4" />
              <p className="text-palette-600 text-lg">No ongoing assignments</p>
              <p className="text-palette-500 text-sm mt-2">All caught up! Great job!</p>
            </div>
          )
        ) : (
          completedAssignments.length > 0 ? (
            completedAssignments.map(renderAssignmentCard)
          ) : (
            <div className="col-span-2 text-center py-12">
              <FolderOpen className="h-16 w-16 text-palette-400 mx-auto mb-4" />
              <p className="text-palette-600 text-lg">No completed assignments yet</p>
              <p className="text-palette-500 text-sm mt-2">Complete your assignments to see them here</p>
            </div>
          )
        )}
      </div>

      {/* Overdue Warning */}
      {activeTab === 'ongoing' && ongoingAssignments.some(a => getDaysRemaining(a.dueDate) < 0) && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">
            You have <span className="font-semibold">{ongoingAssignments.filter(a => getDaysRemaining(a.dueDate) < 0).length}</span> overdue assignment(s). 
            Please submit them as soon as possible.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsWidget;