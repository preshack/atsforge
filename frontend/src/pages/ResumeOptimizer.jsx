import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Upload,
  Target,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  XCircle,
  FileUp,
  File,
  Trash2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";
import axios from "axios";
import { API } from "../App";

const ResumeOptimizer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    setUploadedFile(file);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/resumes/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResumeText(response.data.extracted_text || "");
      setUploadedResumeId(response.data.resume_id);
      toast.success("Resume uploaded and parsed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to parse file");
      setUploadedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !uploadedResumeId) {
      toast.error("Please upload a resume or paste your resume content");
      return;
    }

    setLoading(true);
    try {
      const resumeContent = {
        personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "" },
        summary: resumeText.substring(0, 500),
        experience: [],
        education: [],
        skills: resumeText.split(/[,\n•·]/).filter(s => s.trim().length > 2 && s.trim().length < 40).slice(0, 30),
        certifications: []
      };

      const response = await axios.post(`${API}/resumes/optimize`, {
        resume_content: resumeContent,
        job_description: jobDescription || undefined
      }, {
        withCredentials: true
      });

      setAnalysisResult(response.data);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setResumeText("");
    setUploadedResumeId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-slate-900">Resume Optimizer</h1>
              <p className="text-xs text-slate-500">Analyze & improve your resume</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 lg:p-10">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                Optimize Your Resume for ATS
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your resume to get instant ATS compatibility scoring, keyword analysis, and improvement suggestions.
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center mb-6 transition-all ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : uploadedFile
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="upload-area"
            >
              {loading ? (
                <div className="py-8">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Processing your resume...</p>
                </div>
              ) : uploadedFile ? (
                <div className="py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <File className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">{uploadedFile.name}</p>
                  <p className="text-sm text-slate-500 mb-4">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Ready to analyze
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFile}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove file
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileUp className="w-10 h-10 text-indigo-600" />
                  </div>
                  <p className="text-lg text-slate-700 mb-2">
                    <span className="font-semibold">Drop your resume here</span> or{" "}
                    <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-semibold underline underline-offset-2">
                      browse files
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        className="hidden"
                        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                        data-testid="file-input"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-slate-500">Supports PDF, DOCX, and TXT files</p>
                </>
              )}
            </div>

            {/* Manual Input */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
              <Label className="text-slate-900 font-semibold mb-3 block text-lg">
                Or paste your resume content
              </Label>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here to analyze..."
                rows={8}
                className="mb-6 text-base"
                data-testid="resume-text-input"
              />

              <Label className="text-slate-900 font-semibold mb-3 block text-lg">
                Target Job Description <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to get targeted keyword optimization and matching score..."
                rows={6}
                className="text-base"
                data-testid="job-description-input"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || (!resumeText.trim() && !uploadedFile)}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-7 text-lg rounded-xl shadow-xl shadow-indigo-500/25"
              data-testid="analyze-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                Analysis Complete
              </h2>
              <p className="text-lg text-slate-600">
                Here's how your resume scores for ATS compatibility.
              </p>
            </div>

            {/* Score Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-10 mb-6 text-center">
              <div className="mb-8">
                <div className={`text-7xl font-bold bg-gradient-to-r ${getScoreGradient(analysisResult?.score || 0)} bg-clip-text text-transparent`}>
                  {analysisResult?.score || 0}
                </div>
                <p className="text-slate-500 text-lg mt-2">ATS Compatibility Score</p>
              </div>
              <div className="max-w-md mx-auto">
                <Progress 
                  value={analysisResult?.score || 0} 
                  className="h-4 mb-4"
                />
                <div className="flex justify-between text-sm text-slate-500 font-medium">
                  <span>Needs Work (0-59)</span>
                  <span>Good (60-79)</span>
                  <span>Excellent (80+)</span>
                </div>
              </div>
            </div>

            {/* Issues */}
            {analysisResult?.issues?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  Issues Found ({analysisResult.issues.length})
                </h3>
                <div className="space-y-3">
                  {analysisResult.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-xl ${
                        issue.severity === 'high' ? 'bg-red-50 border border-red-100' :
                        issue.severity === 'medium' ? 'bg-amber-50 border border-amber-100' :
                        'bg-slate-50 border border-slate-100'
                      }`}
                      data-testid={`issue-${index}`}
                    >
                      {issue.severity === 'high' ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{issue.issue}</p>
                        {issue.section && (
                          <p className="text-sm text-slate-500 mt-1">Section: {issue.section}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Matching Keywords ({analysisResult?.keyword_matches?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult?.keyword_matches?.slice(0, 15).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                  {(!analysisResult?.keyword_matches || analysisResult.keyword_matches.length === 0) && (
                    <p className="text-slate-500 text-sm">No matching keywords found</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Missing Keywords ({analysisResult?.missing_keywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult?.missing_keywords?.slice(0, 15).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                  {(!analysisResult?.missing_keywords || analysisResult.missing_keywords.length === 0) && (
                    <p className="text-slate-500 text-sm">No missing keywords</p>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {analysisResult?.suggestions?.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Improvement Suggestions
                </h3>
                <div className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-indigo-100"
                      data-testid={`suggestion-${index}`}
                    >
                      <ChevronRight className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => { setStep(1); setAnalysisResult(null); }}
                className="flex-1 py-6 text-base"
                data-testid="analyze-another-btn"
              >
                Analyze Another Resume
              </Button>
              <Button
                onClick={() => navigate(uploadedResumeId ? `/resume/${uploadedResumeId}` : "/resume/new")}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-6 text-base"
                data-testid="create-optimized-btn"
              >
                {uploadedResumeId ? "Edit Uploaded Resume" : "Create New Resume"}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ResumeOptimizer;
