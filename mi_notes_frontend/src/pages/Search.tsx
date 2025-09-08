import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { noteService } from '../services/api';
import type { Note } from '../types/index';
import { Calendar, Download, FileText, Search as SearchIcon, Tag, User, Filter, X, Sparkles } from 'lucide-react';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (query) {
      searchNotes(query);
    }
  }, [query]);

  useEffect(() => {
    applyFilters();
  }, [notes, selectedSemester, selectedTags]);

  const searchNotes = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const results = await noteService.searchNotes(searchTerm);
      setNotes(results);
    } catch (err) {
      console.error('Search failed:', err);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notes];

    if (selectedSemester !== null) {
      filtered = filtered.filter(note => note.semester === selectedSemester);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        note.tags && Array.isArray(note.tags) &&
        selectedTags.some(tag => note.tags.includes(tag))
      );
    }

    setFilteredNotes(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleDownload = async (noteId: string) => {
    try {
      await noteService.downloadNote(noteId);
    } catch (err) {
      console.error('Failed to download note:', err);
    }
  };

  const getAllTags = (): string[] => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  };

  const getAllSemesters = (): number[] => {
    const semesters = new Set<number>();
    notes.forEach(note => semesters.add(note.semester));
    return Array.from(semesters).sort();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedSemester(null);
    setSelectedTags([]);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const hasActiveFilters = selectedSemester !== null || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-palette-100 to-palette-300 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-palette-700 to-palette-600">
        <div className="absolute inset-0 bg-gradient-to-br from-palette-900/20 to-palette-800/40"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center animate-fade-in-up">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <SearchIcon className="h-16 w-16 text-palette-400 animate-float" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-palette-100 to-palette-white">Search Notes</h1>
            <p className="text-xl text-palette-100 mb-12 max-w-2xl mx-auto">
              Discover study materials from across all modules and semesters
            </p>
            
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto animate-scale-up animation-delay-400">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for notes, modules, topics..."
                  className="w-full pl-16 pr-32 py-6 text-lg bg-palette-white/90 border border-palette-400 rounded-2xl text-palette-800 placeholder-palette-500 backdrop-blur-md transition-all duration-300 focus:outline-none focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20"
                />
                <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {query && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in-up">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-700 to-palette-900">
                  Search Results for "{query}"
                </h2>
                <p className="text-palette-600 mt-2 text-lg">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
                </p>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-palette-white text-palette-700 border-2 border-palette-400 px-6 py-3 rounded-xl font-semibold hover:bg-palette-100 hover:border-palette-600 transform hover:scale-105 transition-all duration-300 group animate-scale-up"
              >
                <Filter className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-gradient-to-r from-palette-600 to-palette-700 text-white text-xs px-3 py-1.5 rounded-full animate-pulse">
                    {(selectedSemester !== null ? 1 : 0) + selectedTags.length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="bg-palette-white rounded-xl shadow-lg p-8 mb-8 animate-slide-in-down border border-palette-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-palette-800 text-xl">Filter Results</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-palette-600 hover:text-palette-700 transition-colors duration-300 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-palette-700 mb-4">
                      Semester
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {getAllSemesters().map((sem, index) => (
                        <button
                          key={sem}
                          onClick={() => setSelectedSemester(
                            selectedSemester === sem ? null : sem
                          )}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                            selectedSemester === sem
                              ? 'bg-gradient-to-r from-palette-600 to-palette-700 text-white'
                              : 'bg-palette-100 text-palette-700 border border-palette-400 hover:border-palette-600 hover:bg-palette-300'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          Semester {sem}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-palette-700 mb-4">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {getAllTags().map((tag, index) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                            selectedTags.includes(tag)
                              ? 'bg-gradient-to-r from-palette-600 to-palette-700 text-white'
                              : 'bg-palette-100 text-palette-700 border border-palette-400 hover:border-palette-600 hover:bg-palette-300'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="text-center animate-fade-in">
                  <div className="w-12 h-12 border-4 border-palette-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                  <p className="text-palette-700">Searching notes...</p>
                </div>
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="space-y-6">
                {filteredNotes.map((note, index) => (
                  <div key={note.id} className="bg-palette-white rounded-xl shadow-lg p-8 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-palette-800 mb-2 group-hover:text-palette-600 transition-colors duration-300">
                          {note.title}
                        </h3>
                        <p className="text-sm text-palette-600 mb-3 font-semibold">
                          {note.moduleName} • Semester {note.semester}
                        </p>
                        <p className="text-palette-700 mb-4 text-lg group-hover:text-palette-800 transition-colors duration-300">{note.description}</p>
                        
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-3 mb-4">
                            {note.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-palette-100 border border-palette-400 text-palette-600 hover:bg-palette-300 transition-all duration-300 cursor-default"
                              >
                                <Tag className="h-3 w-3 mr-1.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-6 text-sm text-palette-600">
                          <span className="flex items-center group-hover:text-palette-700 transition-colors duration-300">
                            <User className="h-4 w-4 mr-2" />
                            {note.uploadedBy.name}
                          </span>
                          <span className="flex items-center group-hover:text-palette-700 transition-colors duration-300">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(note.uploadedAt)}
                          </span>
                          <span className="flex items-center group-hover:text-palette-700 transition-colors duration-300">
                            <FileText className="h-4 w-4 mr-2" />
                            {formatFileSize(note.fileSize)}
                          </span>
                          <span className="flex items-center group-hover:text-palette-700 transition-colors duration-300">
                            <Download className="h-4 w-4 mr-2" />
                            {note.downloads} downloads
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(note.id)}
                        className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ml-6 group/btn"
                      >
                        <Download className="h-5 w-5 mr-2 group-hover/btn:animate-bounce" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-palette-white rounded-xl shadow-lg text-center p-16 animate-bounce-in">
                <div className="relative mb-8">
                  <SearchIcon className="h-24 w-24 text-palette-500 mx-auto animate-float" />
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-palette-800 mb-4">
                  No results found
                </h3>
                <p className="text-palette-600 text-lg mb-8">
                  Try different keywords or adjust your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-palette-white text-palette-700 border-2 border-palette-400 px-6 py-3 rounded-xl font-semibold hover:bg-palette-100 hover:border-palette-600 transform hover:scale-105 transition-all duration-300 animate-scale-up group"
                >
                  <X className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;