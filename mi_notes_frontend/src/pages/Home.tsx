import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { moduleService } from "../services/api";
import type { Module } from "../types/index";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import graduationHatImg from "../assets/graduation-hat.jpg";
import ExamCalendar from "../widgets/ExamCalendar";
import AssignmentsWidget from "../widgets/AssignmentsWidget";

const Home: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModules(selectedSemester);
  }, [selectedSemester]);

  const loadModules = async (semester: number) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await moduleService.getModulesBySemester(semester);
      setModules(data);
    } catch (err) {
      // For demo purposes, show empty state when API is not available
      setModules([]);
      console.error("API not available:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const stats = [
    {
      icon: FileText,
      value: "1000+",
      label: "Study Notes",
      color: "text-palette-600",
    },
    {
      icon: Users,
      value: "500+",
      label: "Active Students",
      color: "text-palette-700",
    },
    {
      icon: BookOpen,
      value: "50+",
      label: "Modules",
      color: "text-palette-800",
    },
    {
      icon: GraduationCap,
      value: "8",
      label: "Semesters",
      color: "text-palette-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-palette-100 to-palette-300 animate-fade-in">
      <div className="relative w-full h-[600px] flex items-center justify-center">
                {/* Graduation hat background image */}
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center opacity-9
                  0"
                  style={{ 
                    backgroundImage: `url(${graduationHatImg})`,
                    filter: 'blur(2px)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="relative z-10 text-center px-4">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-palette-800 to-palette-900 animate-fade-in-up animation-delay-200">
                    Welcome to Mi_Notes
                  </h1>
                  <p className="text-xl md:text-2xl mb-12 text-palette-700 animate-fade-in-up animation-delay-400">
                    Share and access study materials with your peers
                  </p>
                </div>
              </div>
      <div className="relative overflow-hidden bg-gradient-to-r from-palette-300 to-palette-400">
        <div className="absolute inset-0 bg-gradient-to-br from-palette-100/20 to-palette-300/40"></div>
        <div className="relative container mx-auto px-4 py-20 animate-fade-in-up">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              {/* <div className="relative">
                <BookOpen className="h-16 w-16 text-palette-pink animate-float" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-peach animate-pulse" />
              </div> */}
              
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center card-hover-effect group animate-bounce-in animation-delay-${
                    index * 200
                  }`}
                >
                  <div className="relative mb-4">
                    <stat.icon
                      className={`h-16 w-16 mx-auto ${stat.color} group-hover:scale-110 transition-transform duration-300 animate-float-rotate`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-palette-400/20 to-palette-600/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2 text-palette-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-palette-700 group-hover:text-palette-900 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-scale-up animation-delay-600 group"
              >
                <TrendingUp className="h-5 w-5 mr-2 inline group-hover:animate-bounce" />
                Upload Notes
              </Link>
              <Link
                to="/search"
                className="bg-white/50 backdrop-blur-sm text-palette-800 border-2 border-palette-500/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/70 hover:border-palette-600/50 transform hover:scale-105 transition-all duration-300 animate-scale-up animation-delay-800"
              >
                Explore Notes
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Exam Calendar Widget */}
        <ExamCalendar />
        
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900 text-center">
            Select Semester
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {semesters.map((sem, index) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 animate-slide-in-right ${
                  selectedSemester === sem
                    ? "bg-gradient-to-r from-palette-700 to-palette-600 text-white shadow-lg"
                    : "bg-white/30 backdrop-blur-sm text-palette-700 border border-palette-400/30 hover:border-palette-600/50 hover:shadow-md"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900 text-center">
            Modules - Semester {selectedSemester}
          </h2>

          {error && (
            <div className="bg-white/50 backdrop-blur-sm border border-red-500/30 text-red-600 px-6 py-4 rounded-lg mb-6 animate-shake">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-3 text-red-500" />
                {error}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-palette-600 border-t-palette-700 rounded-full animate-spin"></div>
            </div>
          ) : modules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((module, index) => (
                <Link
                  key={module.id}
                  to={`/modules/${module.id}/notes`}
                  className="bg-white/50 backdrop-blur-sm border border-palette-400/30 rounded-xl p-6 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-palette-800 mb-2 group-hover:text-palette-900 transition-colors duration-300">
                        {module.name}
                      </h3>
                      <p className="text-sm text-palette-600 font-medium">
                        {module.code}
                      </p>
                    </div>
                    <div className="bg-palette-400/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-palette-700 border border-palette-500/30">
                      {module.credits} Credits
                    </div>
                  </div>

                  <p className="text-palette-700 mb-6 line-clamp-2 group-hover:text-palette-800 transition-colors duration-300">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-palette-600 group-hover:text-palette-700 transition-colors duration-300">
                      <FileText className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">
                        {module.noteCount} notes
                      </span>
                    </div>
                    <span className="text-palette-700 font-semibold group-hover:text-palette-900 transition-colors duration-300 flex items-center">
                      View Notes
                      <TrendingUp className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm border border-palette-400/30 rounded-xl text-center p-16 animate-bounce-in">
              <div className="relative mb-8">
                <BookOpen className="h-24 w-24 text-palette-600 mx-auto animate-float" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-palette-800 mb-4">
                No modules available
              </h3>
              <p className="text-palette-600 mb-8 text-lg">
                No modules found for Semester {selectedSemester}
              </p>
              <Link
                to="/upload"
                className="inline-block bg-gradient-to-r from-palette-700 to-palette-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-scale-up"
              >
                Upload First Note
              </Link>
            </div>
          )}
        </div>
        
        {/* Assignments Widget */}
        <AssignmentsWidget />
      </div>
    </div>
  );
};

export default Home;
