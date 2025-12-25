import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Plus,
  MoreVertical,
  Trash2,
  Copy,
  Download,
  Edit3,
  Loader2,
  Search
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";
import { API } from "../App";

const ResumeHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API}/resumes`, {
        withCredentials: true
      });
      setResumes(response.data);
    } catch (error) {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (resumeId) => {
    try {
      const response = await axios.post(`${API}/resumes/${resumeId}/duplicate`, {}, {
        withCredentials: true
      });
      setResumes(prev => [response.data, ...prev]);
      toast.success("Resume duplicated");
    } catch (error) {
      toast.error("Failed to duplicate resume");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      await axios.delete(`${API}/resumes/${deleteId}`, {
        withCredentials: true
      });
      setResumes(prev => prev.filter(r => r.resume_id !== deleteId));
      toast.success("Resume deleted");
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleExport = async (resumeId, format, title) => {
    try {
      const response = await axios.post(`${API}/export/${format}/${resumeId}`, {}, {
        withCredentials: true,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export resume");
    }
  };

  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-semibold text-slate-900">My Resumes</span>
          </div>
        </div>

        <Link to="/resume/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="new-resume-btn">
            <Plus className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">New Resume</span>
          </Button>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes..."
              className="pl-10"
              data-testid="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filteredResumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? "No resumes found" : "No resumes yet"}
            </h2>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create your first ATS-optimized resume"}
            </p>
            {!searchQuery && (
              <Link to="/resume/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Resume
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredResumes.map((resume, index) => (
              <motion.div
                key={resume.resume_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
                data-testid={`resume-item-${resume.resume_id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/resume/${resume.resume_id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {resume.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>v{resume.version}</span>
                        <span>•</span>
                        <span>{new Date(resume.updated_at).toLocaleDateString()}</span>
                        {resume.ats_score && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">
                              ATS: {resume.ats_score}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/resume/${resume.resume_id}`}>
                      <Button variant="ghost" size="sm" data-testid={`edit-${resume.resume_id}`}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`menu-${resume.resume_id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicate(resume.resume_id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(resume.resume_id, "pdf", resume.title)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(resume.resume_id, "docx", resume.title)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export DOCX
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(resume.resume_id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResumeHistory;
