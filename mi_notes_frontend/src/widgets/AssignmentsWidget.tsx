import React, { useState, useRef, useEffect } from 'react';
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
  FolderOpen,
  X
} from 'lucide-react';
import { assignmentService, moduleService } from '../services/api';
import type { Assignment, Module } from '../types';

const AssignmentsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for new assignment
  const [newAssignment, setNewAssignment] = useState({
    module_id: '',
    title: '',
    deadline: ''
  });

  // Fetch assignments from database
  useEffect(() => {
    fetchAssignments();
    fetchModules();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAllAssignments();
      setAssignments(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const data = await moduleService.getAllModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  const ongoingAssignments = assignments.filter(a => a.status === 'Ongoing');
  const completedAssignments = assignments.filter(a => a.status === 'Complete');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, assignmentId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const uploadedDoc = await assignmentService.uploadDocument(assignmentId, file);
        
        // Update local state
        setAssignments(prev => prev.map(assignment => {
          if (assignment.assignment_id === assignmentId) {
            return {
              ...assignment,
              documents: [...assignment.documents, uploadedDoc]
            };
          }
          return assignment;
        }));
        setUploadingFor(null);
      } catch (err) {
        console.error('Failed to upload document:', err);
        alert('Failed to upload document. Please try again.');
      }
    }
  };

  const handleDeleteFile = async (assignmentId: number, docId: number) => {
    try {
      await assignmentService.deleteDocument(assignmentId, docId);
      
      // Update local state
      setAssignments(prev => prev.map(assignment => {
        if (assignment.assignment_id === assignmentId) {
          return {
            ...assignment,
            documents: assignment.documents.filter(doc => doc.doc_id !== docId)
          };
        }
        return assignment;
      }));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleCompleteAssignment = async (assignmentId: number) => {
    try {
      await assignmentService.updateAssignment(assignmentId, { status: 'Complete' });
      
      // Update local state
      setAssignments(prev => prev.map(assignment => {
        if (assignment.assignment_id === assignmentId) {
          return {
            ...assignment,
            status: 'Complete' as const
          };
        }
        return assignment;
      }));
    } catch (err) {
      console.error('Failed to update assignment:', err);
      alert('Failed to complete assignment. Please try again.');
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.module_id || !newAssignment.title || !newAssignment.deadline) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const createdAssignment = await assignmentService.createAssignment({
        module_id: parseInt(newAssignment.module_id),
        title: newAssignment.title,
        deadline: newAssignment.deadline
      });
      
      // Find module details for the new assignment
      const module = modules.find(m => m.id === newAssignment.module_id);
      if (module) {
        createdAssignment.module_name = module.name;
        createdAssignment.module_code = module.code;
      }
      
      setAssignments(prev => [...prev, createdAssignment]);
      setShowAddModal(false);
      setNewAssignment({ module_id: '', title: '', deadline: '' });
    } catch (err) {
      console.error('Failed to create assignment:', err);
      alert('Failed to create assignment. Please try again.');
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const due = new Date(deadline);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (status: string, deadline?: string) => {
    if (status === 'Complete') return 'text-green-600 bg-green-100 border-green-300';
    
    const daysLeft = deadline ? getDaysRemaining(deadline) : 999;
    if (daysLeft < 0) return 'text-red-600 bg-red-100 border-red-300';
    if (daysLeft <= 3) return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-palette-600 bg-palette-100 border-palette-300';
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const daysLeft = getDaysRemaining(assignment.deadline);
    const isOverdue = daysLeft < 0 && assignment.status !== 'Complete';
    
    return (
      <div 
        key={assignment.assignment_id}
        className="bg-palette-white rounded-lg border border-palette-300/50 p-5 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-palette-800 mb-1">{assignment.title}</h4>
            <p className="text-sm text-palette-600">
              {assignment.module_name || 'Unknown Module'} 
              {assignment.module_code && ` (${assignment.module_code})`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status, assignment.deadline)}`}>
            {assignment.status === 'Complete' ? 'COMPLETED' :
             isOverdue ? 'OVERDUE' :
             'ONGOING'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-palette-600 mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
          </div>
          {assignment.status !== 'Complete' && (
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
        </div>

        {/* File Attachment Section */}
        <div className="border-t border-palette-200 pt-3">
          {assignment.documents && assignment.documents.length > 0 ? (
            <div className="space-y-2">
              {assignment.documents.map((doc) => (
                <div key={doc.doc_id} className="flex items-center justify-between bg-palette-100/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-palette-600" />
                    <div>
                      <p className="text-sm font-medium text-palette-700">{doc.doc_name}</p>
                      <p className="text-xs text-palette-500">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={`http://localhost:5000${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-palette-200 rounded-lg transition-colors"
                      title="View file"
                    >
                      <Eye className="h-4 w-4 text-palette-600" />
                    </a>
                    <a 
                      href={`http://localhost:5000${doc.file_path}`}
                      download
                      className="p-2 hover:bg-palette-200 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <Download className="h-4 w-4 text-palette-600" />
                    </a>
                    {assignment.status !== 'Complete' && (
                      <button 
                        onClick={() => handleDeleteFile(assignment.assignment_id, doc.doc_id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : assignment.status !== 'Complete' ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-palette-500">No file attached</p>
              <input
                ref={uploadingFor === assignment.assignment_id ? fileInputRef : null}
                type="file"
                id={`file-upload-${assignment.assignment_id}`}
                className="hidden"
                onChange={(e) => handleFileUpload(e, assignment.assignment_id)}
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              />
              <button
                onClick={() => {
                  setUploadingFor(assignment.assignment_id);
                  document.getElementById(`file-upload-${assignment.assignment_id}`)?.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-palette-600 text-white rounded-lg hover:bg-palette-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </button>
            </div>
          ) : (
            <p className="text-sm text-palette-500 italic">Assignment completed</p>
          )}
          
          {assignment.status !== 'Complete' && (
            <input
              type="file"
              id={`file-upload-add-${assignment.assignment_id}`}
              className="hidden"
              onChange={(e) => handleFileUpload(e, assignment.assignment_id)}
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
            />
          )}
          
          {assignment.status !== 'Complete' && assignment.documents.length > 0 && (
            <button
              onClick={() => {
                document.getElementById(`file-upload-add-${assignment.assignment_id}`)?.click();
              }}
              className="mt-2 text-sm text-palette-600 hover:text-palette-700"
            >
              + Add another document
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {assignment.status !== 'Complete' && assignment.documents.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleCompleteAssignment(assignment.assignment_id)}
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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-palette-100 to-palette-300/50 rounded-xl shadow-lg p-6 my-12">
        <div className="flex items-center justify-center py-12">
          <div className="text-palette-600">Loading assignments...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-palette-100 to-palette-300/50 rounded-xl shadow-lg p-6 my-12 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-palette-700 mr-3" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900">
              Assignments Manager
            </h2>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-palette-700 text-white rounded-lg hover:bg-palette-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Assignment
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

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
        {activeTab === 'ongoing' && ongoingAssignments.some(a => getDaysRemaining(a.deadline) < 0) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">
              You have <span className="font-semibold">{ongoingAssignments.filter(a => getDaysRemaining(a.deadline) < 0).length}</span> overdue assignment(s). 
              Please submit them as soon as possible.
            </p>
          </div>
        )}
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-palette-800">Add New Assignment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-palette-100 rounded"
              >
                <X className="h-5 w-5 text-palette-600" />
              </button>
            </div>
            
            <form onSubmit={handleAddAssignment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-palette-700 mb-2">
                  Module
                </label>
                <select
                  value={newAssignment.module_id}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, module_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-palette-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-500"
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.name} ({module.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-palette-700 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-palette-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-500"
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-palette-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-palette-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-palette-500"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-palette-600 text-white rounded-lg hover:bg-palette-700 transition-colors"
                >
                  Add Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-palette-200 text-palette-700 rounded-lg hover:bg-palette-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignmentsWidget;