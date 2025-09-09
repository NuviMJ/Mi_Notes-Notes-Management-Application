import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Lock, Mail, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-palette-900 via-palette-800 to-palette-700 px-4 py-12 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-palette-900/60 via-palette-800/40 to-palette-600/20"></div>
      <div className="relative max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-md border border-palette-400/20 rounded-2xl shadow-xl p-8 animate-scale-up">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-palette-600 to-palette-400 p-4 rounded-2xl shadow-lg animate-float">
                <BookOpen className="h-10 w-10 text-palette-100" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-palette-300 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-palette-100 mb-2">Welcome Back</h2>
            <p className="text-palette-300 text-center">Sign in to access your study materials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 px-4 py-3 rounded-lg animate-shake">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-red-300" />
                  {error}
                </div>
              </div>
            )}

            <div className="animate-fade-in-up animation-delay-200">
              <label htmlFor="email" className="block text-sm font-semibold text-palette-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-palette-400 group-focus-within:text-palette-300 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-palette-900/50 backdrop-blur-sm border border-palette-600/30 rounded-lg px-3 py-3 pl-12 text-palette-100 placeholder-palette-500 focus:outline-none focus:border-palette-400 focus:ring-2 focus:ring-palette-400/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="animate-fade-in-up animation-delay-400">
              <label htmlFor="password" className="block text-sm font-semibold text-palette-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-palette-400 group-focus-within:text-palette-300 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-palette-900/50 backdrop-blur-sm border border-palette-600/30 rounded-lg px-3 py-3 pl-12 pr-12 text-palette-100 placeholder-palette-500 focus:outline-none focus:border-palette-400 focus:ring-2 focus:ring-palette-400/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-palette-400 hover:text-palette-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between animate-fade-in-up animation-delay-600">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-palette-400 focus:ring-palette-400 border-palette-600 rounded bg-palette-800/50 checked:bg-palette-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-palette-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-palette-400 hover:text-palette-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-palette-600 to-palette-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-palette-500 hover:to-palette-400 transform hover:scale-[1.02] transition-all duration-200 shadow-lg animate-fade-in-up animation-delay-800 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-palette-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <BookOpen className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  Sign in
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 animate-fade-in-up animation-delay-1000">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-palette-600/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 py-1 bg-palette-900/50 backdrop-blur-sm text-palette-400 rounded-full">New to Mi_Notes?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full bg-transparent border-2 border-palette-500 text-palette-300 font-semibold py-3 px-4 rounded-lg hover:bg-palette-500/10 hover:border-palette-400 hover:text-palette-100 transform hover:scale-[1.02] transition-all duration-200 group animate-scale-up"
              >
                {/* <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" /> */}
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;