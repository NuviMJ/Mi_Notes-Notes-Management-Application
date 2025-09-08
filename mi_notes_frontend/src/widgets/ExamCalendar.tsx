import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExamDate {
  id: number;
  date: string;
  subject: string;
  time: string;
  type: 'midterm' | 'final' | 'quiz';
  venue?: string;
}

const ExamCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Sample exam dates - replace with actual data from API
  const examDates: ExamDate[] = [
  { id: 1, date: '2025-09-12', subject: 'Data Structures', time: '09:00 AM', type: 'midterm', venue: 'Room 101' },
    { id: 2, date: '2025-09-20', subject: 'Database Systems', time: '02:00 PM', type: 'quiz', venue: 'Lab A' },
    { id: 3, date: '2025-09-25', subject: 'Web Development', time: '10:00 AM', type: 'final', venue: 'Hall 1' },
    { id: 4, date: '2025-10-05', subject: 'Operating Systems', time: '09:00 AM', type: 'midterm', venue: 'Room 203' },
    { id: 5, date: '2025-10-10', subject: 'Computer Networks', time: '02:00 PM', type: 'final', venue: 'Hall 2' },
  ];

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
      case 'midterm': return 'bg-palette-500/20 text-palette-800 border-palette-500';
      case 'quiz': return 'bg-green-100 text-green-700 border-green-300';
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
                <div key={exam.id} className="text-sm text-palette-700">
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
                    key={exam.id} 
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
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(exam.type)}`}>
                        {exam.type.toUpperCase()}
                      </span>
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
          <button className="mt-6 w-full bg-gradient-to-r from-palette-600 to-palette-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            + Add New Exam Date
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCalendar;