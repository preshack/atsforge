import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Loader2,
  Download,
  Copy,
  Check,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import { API } from "../App";

const CoverLetterGenerator = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [coverLetter, setCoverLetter] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    position: "",
    job_description: "",
    resume_id: "",
    tone: "professional"
  });
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchResumes();
    if (id) {
      fetchCoverLetter();
    }
  }, [id]);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API}/resumes`, {
        withCredentials: true
      });
      setResumes(response.data);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    }
  };

  const fetchCoverLetter = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cover-letters/${id}`, {
        withCredentials: true
      });
      setCoverLetter(response.data);
      setContent(response.data.content);
      setFormData({
        title: response.data.title,
        company_name: "",
        position: "",
        job_description: response.data.job_description,
        resume_id: "",
        tone: response.data.tone
      });
    } catch (error) {
      toast.error("Failed to load cover letter");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.job_description.trim()) {
      toast.error("Please add a job description");
      return;
    }

    if (!formData.title.trim()) {
      setFormData(prev => ({
        ...prev,
        title: `Cover Letter - ${formData.company_name || formData.position || "New"}`
      }));
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API}/cover-letters`, {
        title: formData.title || `Cover Letter - ${formData.company_name || "New"}`,
        job_description: formData.job_description,
        resume_id: formData.resume_id || undefined,
        tone: formData.tone,
        company_name: formData.company_name || undefined,
        position: formData.position || undefined
      }, {
        withCredentials: true
      });

      setCoverLetter(response.data);
      setContent(response.data.content);
      navigate(`/cover-letter/${response.data.cover_letter_id}`, { replace: true });
      toast.success("Cover letter generated!");
    } catch (error) {
      toast.error("Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!coverLetter) return;

    try {
      const response = await axios.post(
        `${API}/export/cover-letter/pdf/${coverLetter.cover_letter_id}`,
        {},
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${coverLetter.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Cover letter exported as PDF");
    } catch (error) {
      toast.error("Failed to export cover letter");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

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
            <span className="font-heading font-semibold text-slate-900">
              {coverLetter ? coverLetter.title : "New Cover Letter"}
            </span>
          </div>
        </div>

        {coverLetter && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              data-testid="copy-btn"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
            <Button
              onClick={handleExport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="export-btn"
            >
              <Download className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">
                {coverLetter ? "Cover Letter Details" : "Generate Cover Letter"}
              </h2>

              <div className="space-y-5">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Application for Software Engineer at Google"
                    className="mt-1.5"
                    data-testid="title-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      placeholder="Google"
                      className="mt-1.5"
                      data-testid="company-input"
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      placeholder="Software Engineer"
                      className="mt-1.5"
                      data-testid="position-input"
                    />
                  </div>
                </div>

                <div>
                  <Label>Job Description *</Label>
                  <Textarea
                    value={formData.job_description}
                    onChange={(e) => handleChange("job_description", e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="mt-1.5"
                    data-testid="job-description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Base on Resume</Label>
                    <Select
                      value={formData.resume_id}
                      onValueChange={(value) => handleChange("resume_id", value)}
                    >
                      <SelectTrigger className="mt-1.5" data-testid="resume-select">
                        <SelectValue placeholder="Select a resume (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.resume_id} value={resume.resume_id}>
                            {resume.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tone</Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) => handleChange("tone", value)}
                    >
                      <SelectTrigger className="mt-1.5" data-testid="tone-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!coverLetter && (
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !formData.job_description.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base"
                    data-testid="generate-btn"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Generate Cover Letter
                      </>
                    )}
                  </Button>
                )}

                {coverLetter && (
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full"
                    data-testid="regenerate-btn"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[600px]">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">
                Preview
              </h2>

              {content ? (
                <div className="prose prose-slate max-w-none">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[500px] font-serif text-base leading-relaxed resize-none border-0 focus:ring-0 p-0"
                    data-testid="content-editor"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Mail className="w-16 h-16 text-slate-200 mb-4" />
                  <p className="text-slate-500 mb-2">Your cover letter will appear here</p>
                  <p className="text-sm text-slate-400">
                    Fill in the details and click Generate
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CoverLetterGenerator;
