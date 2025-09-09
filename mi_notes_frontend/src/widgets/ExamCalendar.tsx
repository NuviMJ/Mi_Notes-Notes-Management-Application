import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { examService, moduleService } from '../services/api';
import type { Module, CreateExamData } from '../types';

interface ExamDisplay {
  exam_id: string;
  date: string;
  subject: string;
  time: string;
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  venue?: string;
  module_id: string;
}

const ExamCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [examDates, setExamDates] = useState<ExamDisplay[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateExamData>({
    module_id: '',
    exam_name: '',
    exam_date: '',
    exam_type: 'midterm'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
    fetchModules();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const exams = await examService.getAllExams();
      const formattedExams: ExamDisplay[] = exams.map(exam => ({
        exam_id: exam.exam_id,
        date: exam.exam_date,
        subject: exam.module?.name || exam.exam_name,
        time: new Date(exam.exam_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        type: exam.exam_type,
        module_id: exam.module_id
      }));
      setExamDates(formattedExams);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const modulesData = await moduleService.getAllModules();
      setModules(modulesData);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (editingExamId) {
        await examService.updateExam(editingExamId, formData);
        setShowEditModal(false);
        setEditingExamId(null);
      } else {
        await examService.createExam(formData);
        setShowAddModal(false);
      }
      await fetchExams();
      setFormData({
        module_id: '',
        exam_name: '',
        exam_date: '',
        exam_type: 'midterm'
      });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editingExamId ? 'update' : 'create'} exam`);
    }
  };

  const handleEdit = (exam: ExamDisplay) => {
    const examDateTime = new Date(exam.date).toISOString().slice(0, 16);
    setFormData({
      module_id: exam.module_id,
      exam_name: exam.subject,
      exam_date: examDateTime,
      exam_type: exam.type
    });
    setEditingExamId(exam.exam_id);
    setShowEditModal(true);
  };

  const handleDelete = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examService.deleteExam(examId);
        await fetchExams();
      } catch (err) {
        console.error('Failed to delete exam:', err);
        setError('Failed to delete exam');
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const hasExam = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return examDates.some(exam => exam.date === dateStr);
  };

  const getExamForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return examDates.filter(exam => exam.date === dateStr);
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'final': return 'bg-red-100 text-red-700 border-red-300';
      case 'midterm': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'quiz': return 'bg-green-100 text-green-700 border-green-300';
      case 'assignment': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const upcomingExams = examDates
    .filter(exam => new Date(exam.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);

    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
      const hasExamDay = hasExam(day);
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
          className={`p-2 text-center cursor-pointer rounded-lg transition-all duration-200 ${
            isToday ? 'bg-palette-600 text-white font-bold' : ''
          } ${
            hasExamDay ? 'bg-palette-400/20 border-2 border-palette-500' : 'hover:bg-palette-100'
          } ${
            selectedDate?.getDate() === day && 
            selectedDate?.getMonth() === currentMonth.getMonth() ? 
            'ring-2 ring-palette-700' : ''
          }`}
        >
          <span className={hasExamDay ? 'font-semibold text-palette-800' : ''}>{day}</span>
          {hasExamDay && (
            <div className="w-2 h-2 bg-palette-600 rounded-full mx-auto mt-1"></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-palette-white rounded-xl shadow-lg p-6 my-12 animate-fade-in-up">
      <div className="flex items-center mb-6">
        <Calendar className="h-8 w-8 text-palette-700 mr-3" />
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900">
          Exam Schedule & Calendar
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-palette-100/30 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-palette-300/30 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-palette-700" />
            </button>
            <h3 className="text-xl font-semibold text-palette-800">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-palette-300/30 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-palette-700" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-palette-600 p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Selected Date Exams */}
          {selectedDate && getExamForDay(selectedDate.getDate()).length > 0 && (
            <div className="mt-4 p-4 bg-palette-300/20 rounded-lg">
              <h4 className="font-semibold text-palette-800 mb-2">
                Exams on {selectedDate.toLocaleDateString()}:
              </h4>
              {getExamForDay(selectedDate.getDate()).map(exam => (
                <div key={exam.exam_id} className="text-sm text-palette-700">
                  {exam.subject} - {exam.time}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exams List */}
        <div className="bg-palette-100/30 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-palette-600 mr-2" />
            <h3 className="text-xl font-semibold text-palette-800">Upcoming Exams</h3>
          </div>

          <div className="space-y-3">
            {upcomingExams.length > 0 ? (
              upcomingExams.map(exam => {
                const examDate = new Date(exam.date);
                const daysUntil = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div 
                    key={exam.exam_id} 
                    className="bg-palette-white p-4 rounded-lg border border-palette-300/50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-palette-800">{exam.subject}</h4>
                        <div className="flex items-center text-sm text-palette-600 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {exam.time}
                          {exam.venue && <span className="ml-3">📍 {exam.venue}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(exam.type)}`}>
                          {exam.type.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-1.5 hover:bg-palette-200 rounded-lg transition-colors group"
                          title="Edit exam"
                        >
                          <Edit2 className="h-4 w-4 text-palette-600 group-hover:text-palette-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.exam_id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors group"
                          title="Delete exam"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-palette-700">
                        {examDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-sm font-semibold ${
                        daysUntil <= 3 ? 'text-red-600' : 
                        daysUntil <= 7 ? 'text-yellow-600' : 
                        'text-palette-600'
                      }`}>
                        {daysUntil === 0 ? 'Today' : 
                         daysUntil === 1 ? 'Tomorrow' : 
                         `In ${daysUntil} days`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-palette-600">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-palette-400" />
                <p>No upcoming exams scheduled</p>
              </div>
            )}
          </div>

          {/* Add Exam Button */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-6 w-full bg-gradient-to-r from-palette-600 to-palette-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Exam Date
          </button>
        </div>
      </div>

      {/* Add/Edit Exam Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-palette-800">{editingExamId ? 'Edit Exam' : 'Add New Exam'}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingExamId(null);
                  setFormData({
                    module_id: '',
                    exam_name: '',
                    exam_date: '',
                    exam_type: 'midterm'
                  });
                }}
                className="p-2 hover:bg-palette-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-palette-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-palette-700 mb-2">
                  Module
                </label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({...formData, module_id: e.target.value})}
                  className="w-full px-4 py-2 border border-palette-300 rounded-lg focus:outline-none focus:border-palette-500"
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.code} - {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-palette-700 mb-2">
                  Exam Name
                </label>
                <input
                  type="text"
                  value={formData.exam_name}
                  onChange={(e) => setFormData({...formData, exam_name: e.target.value})}
                  className="w-full px-4 py-2 border border-palette-300 rounded-lg focus:outline-none focus:border-palette-500"
                  placeholder="e.g., Midterm Exam"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-palette-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                  className="w-full px-4 py-2 border border-palette-300 rounded-lg focus:outline-none focus:border-palette-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-palette-700 mb-2">
                  Exam Type
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({...formData, exam_type: e.target.value as CreateExamData['exam_type']})}
                  className="w-full px-4 py-2 border border-palette-300 rounded-lg focus:outline-none focus:border-palette-500"
                  required
                >
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingExamId(null);
                    setFormData({
                      module_id: '',
                      exam_name: '',
                      exam_date: '',
                      exam_type: 'midterm'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-palette-400 text-palette-700 rounded-lg hover:bg-palette-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-palette-600 to-palette-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingExamId ? 'Update Exam' : 'Add Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCalendar;