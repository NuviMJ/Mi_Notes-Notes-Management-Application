import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { moduleService, noteService } from "../services/api";
import type { Module, Note } from "../types/index";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Search,
  Tag,
  User,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Share2,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const NotesList: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
    "newest"
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  useEffect(() => {
    if (moduleId) {
      loadModuleAndNotes();
    }
  }, [moduleId]);

  useEffect(() => {
    filterAndSortNotes();
  }, [notes, searchQuery, selectedTags, sortBy]);

  const loadModuleAndNotes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [moduleData, notesData] = await Promise.all([
        moduleService.getModule(moduleId!),
        noteService.getNotesByModule(moduleId!),
      ]);
      setModule(moduleData);
      setNotes(notesData);
    } catch (err) {
      setError("Failed to load data. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortNotes = () => {
    let filtered = [...notes];

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(
        (note) =>
          note.tags &&
          Array.isArray(note.tags) &&
          selectedTags.some((tag) => note.tags.includes(tag))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          );
        case "popular":
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  };

  const handleDownload = async (noteId: string) => {
    try {
      await noteService.downloadNote(noteId);
    } catch (err) {
      console.error("Failed to download note:", err);
    }
  };

  const handleWhatsAppShare = (note: Note) => {
    const shareUrl = `${window.location.origin}/note/${note.id}`;
    const message = `📚 *${note.title}*\n\n${note.description}\n\n📖 Module: ${
      note.moduleName
    }\n🎓 Semester: ${module?.semester || "N/A"}\n👤 Uploaded by: ${
      note.uploadedBy.name
    }\n📄 File: ${
      note.fileName || "Document"
    }\n\n✅ *Click to Download:*\n${shareUrl}\n\n_Shared from Mi Notes - Your Study Companion_`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await noteService.deleteNote(noteToDelete.id);
      setNotes(notes.filter((n) => n.id !== noteToDelete.id));
      setDeleteModalOpen(false);
      setNoteToDelete(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError("Failed to delete note. Please try again.");
    }
  };

  const handleEditClick = (note: Note) => {
    setNoteToEdit(note);
    setEditModalOpen(true);
  };

  const handleEditSave = async (updatedNote: Partial<Note>) => {
    if (!noteToEdit) return;

    try {
      const updated = await noteService.updateNote(noteToEdit.id, updatedNote);
      setNotes(notes.map((n) => (n.id === noteToEdit.id ? updated : n)));
      setEditModalOpen(false);
      setNoteToEdit(null);
    } catch (err) {
      console.error("Failed to update note:", err);
      setError("Failed to update note. Please try again.");
    }
  };

  const handleViewClick = async (noteId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notes/download/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up the URL after a short delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        console.error('Failed to open note');
      }
    } catch (err) {
      console.error('Failed to open note:', err);
    }
  };

  const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const getAllTags = (): string[] => {
    const tagsSet = new Set<string>();
    notes.forEach((note) => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-palette-100 to-palette-300">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-palette-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-palette-700">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-palette-100 to-palette-300 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-palette-700 to-palette-600">
        <div className="absolute inset-0 bg-gradient-to-br from-palette-900/20 to-palette-800/40"></div>
        <div className="relative container mx-auto px-4 py-16">
          <Link
            to="/"
            className="inline-flex items-center text-palette-100 hover:text-palette-300 mb-6 transition-all duration-300 hover:scale-105 group animate-slide-in-left"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Modules
          </Link>
          {module && (
            <div className="animate-fade-in-up">
              <div className="flex items-center mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-palette-100 to-palette-white mr-4">
                  {module.name}
                </h1>
                <Sparkles className="h-8 w-8 text-palette-400 animate-pulse" />
              </div>
              <p className="text-xl text-palette-300 mb-2 font-semibold">
                {module.code} • Semester {module.semester}
              </p>
              <p className="text-lg text-palette-100 max-w-3xl">
                {module.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 animate-slide-in-left">
            <div className="bg-palette-white rounded-xl shadow-lg p-6 mb-8 border border-palette-300">
              <h3 className="font-bold text-palette-800 mb-6 flex items-center">
                <Filter className="h-6 w-6 mr-3 text-palette-600" />
                Filters
              </h3>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-palette-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {getAllTags().length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-palette-700 mb-3">
                    Tags
                  </label>
                  <div className="space-y-3">
                    {getAllTags().map((tag, index) => (
                      <label
                        key={tag}
                        className="flex items-center group cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="h-4 w-4 text-palette-600 focus:ring-palette-500 border-palette-400 rounded bg-palette-100"
                        />
                        <span className="ml-3 text-sm text-palette-700 group-hover:text-palette-600 transition-colors duration-200">
                          {tag}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/upload"
              className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full group animate-bounce-in group-hover:animate-bounce"
            >
              Upload Note
            </Link>
          </div>

          <div className="lg:w-3/4 animate-slide-in-right">
            <div className="mb-8">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes in this module..."
                  className="w-full pl-12 pr-4 py-3 border border-palette-300 rounded-lg bg-palette-white text-palette-800 placeholder-palette-500 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20 transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-palette-500 group-focus-within:text-palette-600 transition-colors" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-lg mb-6 animate-shake">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-3 text-red-400" />
                  {error}
                </div>
              </div>
            )}

            {filteredNotes.length > 0 ? (
              <div className="space-y-6">
                {filteredNotes.map((note, index) => (
                  <div
                    key={note.id}
                    className="bg-palette-white rounded-xl shadow-lg p-8 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-palette-800 mb-3 group-hover:text-palette-600 transition-colors duration-300">
                          {note.title}
                        </h3>
                        <p className="text-palette-700 mb-4 text-lg group-hover:text-palette-800 transition-colors duration-300">
                          {note.description}
                        </p>

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
                          {/* <span className="flex items-center group-hover:text-palette-700 transition-colors duration-300">
                            <FileText className="h-4 w-4 mr-2" />
                            {formatFileSize(note.fileSize)}
                          </span>
                          <span className="flex items-center group-hover:text-palette-700 transition-colors duration-300">
                            <Download className="h-4 w-4 mr-2" />
                            {note.downloads} downloads
                          </span> */}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 ml-6">
                        <button
                          onClick={() => handleDownload(note.id)}
                          className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group/btn"
                        >
                          <Download className="h-5 w-5 mr-2 group-hover/btn:animate-bounce" />
                          Download
                        </button>

                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={() => handleViewClick(note.id)}
                            className="p-2 hover:bg-palette-100 rounded-lg transition-all duration-300 group/btn"
                            title="Open Note"
                          >
                            <Eye className="h-5 w-5 text-palette-600 group-hover/btn:animate-bounce" />
                          </button>
                          {getCurrentUser()?.id === note.uploadedBy.id && (
                            <>
                              <button
                                onClick={() => handleEditClick(note)}
                                className="p-2 hover:bg-palette-100 rounded-lg transition-all duration-300 group/btn"
                                title="Edit Note"
                              >
                                <Edit className="h-5 w-5 text-blue-600 group-hover/btn:animate-bounce" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(note)}
                                className="p-2 hover:bg-palette-100 rounded-lg transition-all duration-300 group/btn"
                                title="Delete Note"
                              >
                                <Trash2 className="h-5 w-5 text-red-600 group-hover/btn:animate-bounce" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleWhatsAppShare(note)}
                            className="p-2 hover:bg-palette-100 rounded-lg transition-all duration-300 group/btn"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="h-5 w-5 text-green-600 group-hover/btn:animate-bounce" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-palette-white rounded-xl shadow-lg text-center p-16 animate-bounce-in">
                <div className="relative mb-8">
                  <FileText className="h-24 w-24 text-palette-500 mx-auto animate-float" />
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-palette-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-palette-800 mb-4">
                  No notes found
                </h3>
                <p className="text-palette-600 mb-8 text-lg">
                  {searchQuery || selectedTags.length > 0
                    ? "Try adjusting your filters or search terms"
                    : "Be the first to upload a note for this module"}
                </p>
                {!(searchQuery || selectedTags.length > 0) && (
                  <Link
                    to="/upload"
                    className="bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-scale-up group inline-block"
                  >
                    <TrendingUp className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    Upload First Note
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && noteToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-palette-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
            <h3 className="text-2xl font-bold text-palette-800 mb-4">
              Delete Note
            </h3>
            <p className="text-palette-600 mb-6">
              Are you sure you want to delete "
              <strong>{noteToDelete.title}</strong>"? This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-palette-200 text-palette-700 px-6 py-3 rounded-xl font-semibold hover:bg-palette-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && noteToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-palette-white rounded-xl shadow-2xl max-w-2xl w-full p-8 animate-bounce-in">
            <h3 className="text-2xl font-bold text-palette-800 mb-6">
              Edit Note
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEditSave({
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                });
              }}
            >
              <div className="mb-6">
                <label className="block text-sm font-semibold text-palette-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={noteToEdit.title}
                  className="w-full px-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-palette-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={noteToEdit.description}
                  rows={4}
                  className="w-full px-4 py-3 border border-palette-300 rounded-lg bg-palette-100/50 text-palette-800 focus:border-palette-600 focus:ring-2 focus:ring-palette-400/20"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 bg-palette-200 text-palette-700 px-6 py-3 rounded-xl font-semibold hover:bg-palette-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-palette-700 to-palette-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotesList;
