import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { noteService } from '../services/api';
import type { Note } from '../types/index';
import { Calendar, Download, FileText, Tag, User, ArrowLeft, Sparkles, Share2, ExternalLink } from 'lucide-react';

const PublicNote: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    setIsLoading(true);
    setError('');
    try {
      const noteData = await noteService.getPublicNote(noteId!);
      setNote(noteData);
    } catch (err) {
      setError('Note not found or not available for public viewing.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!note) return;
    try {
      await noteService.downloadNote(note.id);
    } catch (err) {
      console.error('Failed to download note:', err);
    }
  };

  const handleWhatsAppShare = () => {
    if (!note) return;
    const shareUrl = `${window.location.origin}/note/${note.id}`;
    const message = `📚 *${note.title}*\n\n${note.description}\n\n📖 Module: ${note.moduleName}\n🎓 Semester: ${note.semester}\n👤 Uploaded by: ${note.uploadedBy.name}\n\n🔗 View/Download: ${shareUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-palette-100 to-palette-300">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-palette-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-palette-700">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-palette-100 to-palette-300 flex items-center justify-center">
        <div className="bg-palette-white rounded-xl shadow-lg text-center p-16 max-w-md animate-bounce-in">
          <div className="relative mb-8">
            <FileText className="h-24 w-24 text-palette-400 mx-auto" />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-300" />
          </div>
          <h3 className="text-2xl font-bold text-palette-800 mb-4">
            Note Not Found
          </h3>
          <p className="text-palette-600 mb-8">
            {error || 'This note may have been removed or is not available.'}
          </p>
          <a
            href="/"
            className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go to Mi Notes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-palette-100 to-palette-300">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-palette-700 to-palette-600">
        <div className="absolute inset-0 bg-gradient-to-br from-palette-900/20 to-palette-800/40"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center animate-fade-in-up">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <FileText className="h-16 w-16 text-palette-400 animate-float" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-300 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-100 to-palette-white mb-4">
              {note.title}
            </h1>
            <p className="text-xl text-palette-200 mb-2">
              {note.moduleName} • Semester {note.semester}
            </p>
            <p className="text-lg text-palette-100 max-w-3xl mx-auto">
              {note.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-palette-white rounded-xl shadow-lg p-8 animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-palette-800 mb-6">Note Details</h2>
              
              {note.tags && note.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-palette-700 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-palette-100 border border-palette-400 text-palette-600"
                      >
                        <Tag className="h-3 w-3 mr-1.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-palette-600">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-palette-500" />
                  <div>
                    <p className="text-sm font-semibold text-palette-700">Uploaded by</p>
                    <p>{note.uploadedBy.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-palette-500" />
                  <div>
                    <p className="text-sm font-semibold text-palette-700">Upload Date</p>
                    <p>{formatDate(note.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-palette-500" />
                  <div>
                    <p className="text-sm font-semibold text-palette-700">File Size</p>
                    <p>{formatFileSize(note.fileSize)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Download className="h-5 w-5 mr-3 text-palette-500" />
                  <div>
                    <p className="text-sm font-semibold text-palette-700">Downloads</p>
                    <p>{note.downloads} times</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group animate-pulse"
              >
                <Download className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                Download {note.fileName || 'Document'}
              </button>
              
              <button
                onClick={handleWhatsAppShare}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Share2 className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                Share on WhatsApp
              </button>

              <a
                href="/"
                className="bg-palette-white text-palette-700 border-2 border-palette-400 px-8 py-4 rounded-xl font-semibold hover:bg-palette-100 hover:border-palette-600 transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center"
              >
                <ExternalLink className="h-5 w-5 mr-3" />
                Browse More Notes
              </a>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-palette-700 to-palette-600 rounded-xl p-8 mt-8 text-center animate-fade-in-up animation-delay-400">
            <h3 className="text-2xl font-bold text-palette-100 mb-4">
              Want to upload your own notes?
            </h3>
            <p className="text-palette-200 mb-6">
              Join Mi Notes to share your study materials with fellow students
            </p>
            <a
              href="/register"
              className="bg-palette-white text-palette-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-block"
            >
              Join Mi Notes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicNote;