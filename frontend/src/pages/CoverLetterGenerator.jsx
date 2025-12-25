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
  Sparkles,
  FileText,
  Building2,
  Briefcase
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

    const title = formData.title.trim() || `Cover Letter - ${formData.company_name || formData.position || "New"}`;

    setGenerating(true);
    try {
      const response = await axios.post(`${API}/cover-letters`, {
        title: title,
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
      toast.error(error.response?.data?.detail || "Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!coverLetter) return;
    
    try {
      await axios.put(`${API}/cover-letters/${coverLetter.cover_letter_id}`, 
        { content },
        { withCredentials: true }
      );
      toast.success("Cover letter saved!");
    } catch (error) {
      toast.error("Failed to save");
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

  const tones = [
    { value: "professional", label: "Professional", desc: "Formal and corporate" },
    { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
    { value: "confident", label: "Confident", desc: "Bold and assertive" },
    { value: "enthusiastic", label: "Enthusiastic", desc: "Energetic and passionate" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:bg-slate-100"
            data-testid="back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-slate-900">
                {coverLetter ? coverLetter.title : "Cover Letter Generator"}
              </h1>
              <p className="text-xs text-slate-500">AI-powered cover letters</p>
            </div>
          </div>
        </div>

        {coverLetter && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="hidden sm:flex"
              data-testid="copy-btn"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              className="hidden sm:flex"
            >
              Save
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

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8">
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-6">
                {coverLetter ? "Update Details" : "Generate Cover Letter"}
              </h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-slate-700 font-medium">Cover Letter Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Software Engineer at Google"
                    className="mt-2 h-12"
                    data-testid="title-input"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Company Name
                    </Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      placeholder="Google, Amazon, etc."
                      className="mt-2 h-12"
                      data-testid="company-input"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      Position
                    </Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => handleChange("position", e.target.value)}
                      placeholder="Software Engineer"
                      className="mt-2 h-12"
                      data-testid="position-input"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={formData.job_description}
                    onChange={(e) => handleChange("job_description", e.target.value)}
                    placeholder="Paste the full job description here. The more detail, the better the cover letter..."
                    rows={8}
                    className="mt-2 text-base"
                    data-testid="job-description-input"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Base on Resume
                    </Label>
                    <Select
                      value={formData.resume_id}
                      onValueChange={(value) => handleChange("resume_id", value)}
                    >
                      <SelectTrigger className="mt-2 h-12" data-testid="resume-select">
                        <SelectValue placeholder="Select resume (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.resume_id} value={resume.resume_id}>
                            {resume.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-400" />
                      Tone
                    </Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) => handleChange("tone", value)}
                    >
                      <SelectTrigger className="mt-2 h-12" data-testid="tone-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            <div className="flex flex-col">
                              <span>{tone.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!coverLetter ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !formData.job_description.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-7 text-lg rounded-xl shadow-xl shadow-indigo-500/25"
                    data-testid="generate-btn"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Cover Letter
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full py-6 text-base"
                    data-testid="regenerate-btn"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
                    Regenerate with New Settings
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 min-h-[700px] sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900">
                  Preview
                </h2>
                {content && (
                  <div className="flex items-center gap-2 sm:hidden">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>

              {content ? (
                <div className="prose prose-slate max-w-none">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[550px] text-base leading-7 resize-none border-0 focus:ring-0 p-0 bg-transparent"
                    style={{ fontFamily: 'Georgia, serif' }}
                    data-testid="content-editor"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-lg mb-2">Your cover letter will appear here</p>
                  <p className="text-sm text-slate-400 max-w-sm">
                    Fill in the job description and click Generate to create a tailored cover letter
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
