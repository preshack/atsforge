import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Plus,
  MoreVertical,
  Trash2,
  Download,
  Edit3,
  Loader2,
  Search,
  Copy
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

const CoverLetterHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coverLetters, setCoverLetters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      const response = await axios.get(`${API}/cover-letters`, {
        withCredentials: true
      });
      setCoverLetters(response.data);
    } catch (error) {
      toast.error("Failed to fetch cover letters");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      await axios.delete(`${API}/cover-letters/${deleteId}`, {
        withCredentials: true
      });
      setCoverLetters(prev => prev.filter(cl => cl.cover_letter_id !== deleteId));
      toast.success("Cover letter deleted");
    } catch (error) {
      toast.error("Failed to delete cover letter");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleExport = async (coverLetterId, title) => {
    try {
      const response = await axios.post(
        `${API}/export/cover-letter/pdf/${coverLetterId}`,
        {},
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Exported as PDF");
    } catch (error) {
      toast.error("Failed to export cover letter");
    }
  };

  const handleCopy = async (coverLetterId) => {
    try {
      const response = await axios.get(`${API}/cover-letters/${coverLetterId}`, {
        withCredentials: true
      });
      await navigator.clipboard.writeText(response.data.content);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const filteredCoverLetters = coverLetters.filter(cl =>
    cl.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-semibold text-slate-900">Cover Letters</span>
          </div>
        </div>

        <Link to="/cover-letter/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="new-cover-letter-btn">
            <Plus className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">New Cover Letter</span>
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
              placeholder="Search cover letters..."
              className="pl-10"
              data-testid="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : filteredCoverLetters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? "No cover letters found" : "No cover letters yet"}
            </h2>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Generate your first tailored cover letter"}
            </p>
            {!searchQuery && (
              <Link to="/cover-letter/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Cover Letter
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredCoverLetters.map((coverLetter, index) => (
              <motion.div
                key={coverLetter.cover_letter_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
                data-testid={`cover-letter-item-${coverLetter.cover_letter_id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/cover-letter/${coverLetter.cover_letter_id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {coverLetter.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="capitalize">{coverLetter.tone}</span>
                        <span>•</span>
                        <span>{new Date(coverLetter.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/cover-letter/${coverLetter.cover_letter_id}`}>
                      <Button variant="ghost" size="sm" data-testid={`edit-${coverLetter.cover_letter_id}`}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`menu-${coverLetter.cover_letter_id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopy(coverLetter.cover_letter_id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Text
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(coverLetter.cover_letter_id, coverLetter.title)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(coverLetter.cover_letter_id)}
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
            <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your cover letter.
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

export default CoverLetterHistory;
