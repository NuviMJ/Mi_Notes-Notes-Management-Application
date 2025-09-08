import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, Search, Upload, User, X, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-palette-white/90 backdrop-blur-sm border-b border-palette-300 sticky top-0 z-50 animate-fade-in-down shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-palette-600 mr-2 transform group-hover:rotate-12 transition-transform duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-palette-500 animate-pulse" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900">Mi_Notes</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, modules..."
                  className="w-full pl-10 pr-4 py-2 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
              </div>
            </form>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="text-palette-700 hover:text-palette-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  <span className="relative z-10">Home</span>
                  <div className="absolute inset-0 bg-palette-400/20 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center text-palette-700 hover:text-palette-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 relative group"
                >
                  <Upload className="h-4 w-4 mr-1 group-hover:animate-bounce" />
                  <span className="relative z-10">Upload</span>
                  <div className="absolute inset-0 bg-palette-400/20 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-palette-700 hover:text-palette-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <User className="h-4 w-4 mr-1" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-palette-500 rounded-full animate-pulse"></div>
                    </div>
                    {user.name}
                  </button>
                  <div className="absolute right-0 w-48 mt-2 bg-palette-white rounded-lg shadow-lg border border-palette-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 animate-fade-in-up">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-palette-700 hover:bg-palette-100 hover:text-palette-900 transition-all duration-200 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-palette-700 hover:text-palette-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-palette-600 to-palette-700 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-palette-700 hover:text-palette-900 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 animate-scale-up" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-palette-300 bg-palette-white/95 backdrop-blur-sm animate-slide-in-left">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes, modules..."
                  className="w-full pl-10 pr-4 py-2 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-palette-500" />
              </div>
            </form>
            
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block px-3 py-2 text-palette-700 hover:bg-palette-100 hover:text-palette-900 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center px-3 py-2 text-palette-700 hover:bg-palette-100 hover:text-palette-900 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Note
                </Link>
                <div className="border-t border-palette-300 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-palette-600">
                    Signed in as {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-palette-700 hover:bg-palette-100 hover:text-palette-900 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-palette-700 hover:bg-palette-100 hover:text-palette-900 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-gradient-to-r from-palette-600 to-palette-700 text-white px-3 py-2 rounded-lg font-medium text-center transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;