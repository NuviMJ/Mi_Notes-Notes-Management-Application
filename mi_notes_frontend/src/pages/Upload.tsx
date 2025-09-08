import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleService, noteService } from '../services/api';
import type { Module } from '../types/index';
import { AlertCircle, CheckCircle, File, Upload as UploadIcon, X, Sparkles, Plus } from 'lucide-react';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('');
      }
    } else {
      setFilePreview('');
    }
  }, [file]);

  const loadModules = async () => {
    try {
      console.log('Fetching modules...');
      const token = localStorage.getItem('token');
      console.log('Auth token present:', !!token);
      
      const data = await moduleService.getAllModules();
      console.log('Modules fetched:', data);
      console.log('Number of modules:', data?.length);
      if (data && data.length > 0) {
        console.log('First module structure:', data[0]);
      }
      setModules(data || []);
    } catch (err: any) {
      console.error('Failed to load modules - Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load modules. Please check if the backend is running.';
      setError(`Error ${err.response?.status || ''}: ${errorMessage}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('moduleId', moduleId);
    formData.append('tags', tags);

    try {
      await noteService.uploadNote(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/modules/${moduleId}/notes`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-palette-100 to-palette-300 py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-palette-white rounded-xl shadow-lg p-10 animate-scale-up">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <UploadIcon className="h-16 w-16 text-palette-600 animate-float" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900 mb-4">Upload Study Note</h1>
            <p className="text-palette-600 text-lg">Share your knowledge with fellow students</p>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg animate-shake">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={loadModules}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-8 bg-green-50 border border-green-300 text-green-700 px-6 py-4 rounded-lg animate-bounce-in">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 animate-pulse" />
                <span className="text-green-700 font-medium">Note uploaded successfully! Redirecting...</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="animate-fade-in-up animation-delay-200">
              <label htmlFor="title" className="block text-sm font-semibold text-palette-700 mb-3">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                placeholder="e.g., Data Structures Lecture Notes"
              />
            </div>

            <div className="animate-fade-in-up animation-delay-400">
              <label htmlFor="module" className="block text-sm font-semibold text-palette-700 mb-3">
                Module *
              </label>
              <select
                id="module"
                required
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
              >
                <option value="" className="text-palette-500">
                  {modules.length === 0 ? 'No modules available' : 'Select a module'}
                </option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id} className="text-palette-800">
                    {module.name} {module.code ? `(${module.code})` : ''} - Semester {module.semester}
                  </option>
                ))}
              </select>
              {modules.length === 0 && (
                <p className="mt-2 text-sm text-red-600">No modules found. Please check the backend connection.</p>
              )}
            </div>

            <div className="animate-fade-in-up animation-delay-600">
              <label htmlFor="description" className="block text-sm font-semibold text-palette-700 mb-3">
                Description *
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300 resize-none"
                placeholder="Provide a brief description of the content..."
              />
            </div>

            <div className="animate-fade-in-up animation-delay-800">
              <label htmlFor="tags" className="block text-sm font-semibold text-palette-700 mb-3">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                placeholder="e.g., midterm, assignment, lecture (comma separated)"
              />
              <p className="mt-2 text-sm text-palette-600">Separate tags with commas</p>
            </div>

            <div className="animate-fade-in-up animation-delay-1000">
              <label className="block text-sm font-semibold text-palette-700 mb-3">
                File *
              </label>
              
              {!file ? (
                <div className="border-2 border-dashed border-palette-400 rounded-xl p-12 bg-palette-100/30 group hover:border-palette-600 hover:bg-palette-100/50 transition-all duration-300">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="relative mb-6">
                      <UploadIcon className="h-16 w-16 text-palette-600 group-hover:scale-110 transition-transform duration-300 animate-float" />
                      <Plus className="absolute -bottom-1 -right-1 h-6 w-6 text-palette-500 animate-pulse" />
                    </div>
                    <span className="text-palette-800 font-semibold text-lg mb-2 group-hover:text-palette-900 transition-colors duration-300">Click to upload</span>
                    <span className="text-palette-600 text-base mb-4">or drag and drop</span>
                    <span className="text-palette-500 text-sm bg-palette-200/50 px-4 py-2 rounded-full">
                      PDF, DOC, DOCX, PPT, PPTX, TXT, PNG, JPG (max 10MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="bg-palette-100/50 border border-palette-300 rounded-xl p-6 animate-scale-up">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="relative">
                        <File className="h-12 w-12 text-palette-600 mr-4" />
                        <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-palette-800">{file.name}</p>
                        <p className="text-sm text-palette-600">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-100 transition-all duration-300 group"
                    >
                      <X className="h-6 w-6 group-hover:animate-bounce" />
                    </button>
                  </div>
                  
                  {filePreview && (
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-palette-700 mb-3">Preview:</p>
                      <img
                        src={filePreview}
                        alt="File preview"
                        className="max-w-full h-auto max-h-64 rounded-lg border border-palette-300 shadow-md"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-8 animate-fade-in-up animation-delay-1200">
              <button
                type="submit"
                disabled={isLoading || !file}
                className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-1 group text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UploadIcon className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                    Upload Note
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-palette-200 text-palette-700 border-2 border-palette-300 px-8 py-4 rounded-xl font-semibold hover:bg-palette-300 hover:border-palette-400 transform hover:scale-105 transition-all duration-300 flex-1 text-lg group"
              >
                <X className="h-6 w-6 mr-3 inline group-hover:animate-bounce" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;

