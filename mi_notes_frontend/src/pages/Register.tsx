import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Lock, Mail, User, Sparkles, Eye, EyeOff, CheckCircle, UserPlus, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-palette-100 via-palette-200 to-palette-300 px-4 py-12 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-palette-600/10 to-palette-800/20"></div>
      <div className="relative max-w-md w-full">
        <div className="bg-palette-white rounded-2xl shadow-2xl p-8 border border-palette-300 animate-bounce-in">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="bg-gradient-to-r from-palette-700 to-palette-600 p-4 rounded-2xl shadow-lg animate-float">
                <UserPlus className="h-10 w-10 text-palette-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-palette-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900 mb-2">Join Mi_Notes</h2>
            <p className="text-palette-600 text-center">Create an account to start sharing notes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg animate-shake">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-red-400" />
                  {error}
                </div>
              </div>
            )}

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <label htmlFor="name" className="block text-sm font-semibold text-palette-700 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <label htmlFor="email" className="block text-sm font-semibold text-palette-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-palette-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-palette-500 hover:text-palette-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-palette-700 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-palette-500 hover:text-palette-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ animationDelay: '1000ms' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-palette-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-palette-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-palette-white text-palette-600">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex items-center justify-center bg-palette-200 text-palette-700 px-6 py-3 rounded-xl font-semibold hover:bg-palette-300 transition-all duration-300 group"
              >
                <ArrowRight className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Sign in instead
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-palette-500">
              By creating an account, you agree to our
              <br />
              <span className="text-palette-600 hover:text-palette-700 cursor-pointer">Terms of Service</span> and <span className="text-palette-600 hover:text-palette-700 cursor-pointer">Privacy Policy</span>
            </p>
          </div>
      </div>
    </div>
    </div>
  );
};

export default Register;