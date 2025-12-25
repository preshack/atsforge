import { useState, useCallback } from "react";
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
  XCircle
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleFile = (file) => {
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result);
        toast.success("Resume loaded successfully");
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a text file. PDF parsing coming soon!");
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please add your resume content");
      return;
    }

    setLoading(true);
    try {
      // Parse resume text into structured format
      const resumeContent = {
        personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "" },
        summary: resumeText.substring(0, 500),
        experience: [],
        education: [],
        skills: resumeText.split(/[,\n]/).filter(s => s.trim().length > 2 && s.trim().length < 30).slice(0, 20),
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
      toast.error("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

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
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-semibold text-slate-900">Resume Optimizer</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-8">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
                Optimize Your Resume for ATS
              </h1>
              <p className="text-slate-600">
                Upload your resume and optionally add a job description to get targeted optimization tips.
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="upload-area"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">
                Drag and drop your resume here, or{" "}
                <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
                  browse
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                    data-testid="file-input"
                  />
                </label>
              </p>
              <p className="text-sm text-slate-400">Supports TXT files (PDF coming soon)</p>
            </div>

            {/* Manual Input */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <Label className="text-slate-700 font-medium mb-2 block">
                Or paste your resume content
              </Label>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={8}
                className="mb-4"
                data-testid="resume-text-input"
              />

              <Label className="text-slate-700 font-medium mb-2 block">
                Job Description (Optional)
              </Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to get targeted keyword optimization..."
                rows={6}
                data-testid="job-description-input"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !resumeText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg rounded-xl"
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
            {/* Results */}
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
                Analysis Complete
              </h1>
              <p className="text-slate-600">
                Here's how your resume scores for ATS compatibility.
              </p>
            </div>

            {/* Score Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 text-center">
              <div className="mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(analysisResult?.score || 0)}`}>
                  {analysisResult?.score || 0}
                </div>
                <p className="text-slate-500 mt-2">ATS Compatibility Score</p>
              </div>
              <Progress 
                value={analysisResult?.score || 0} 
                className="h-3 mb-4"
              />
              <div className="flex justify-between text-sm text-slate-500">
                <span>Needs Work</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Issues */}
            {analysisResult?.issues?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Issues Found
                </h2>
                <div className="space-y-3">
                  {analysisResult.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                      data-testid={`issue-${index}`}
                    >
                      {getSeverityIcon(issue.severity)}
                      <div>
                        <p className="font-medium text-slate-900">{issue.issue}</p>
                        {issue.section && (
                          <p className="text-sm text-slate-500">Section: {issue.section}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Matching Keywords */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Matching Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult?.keyword_matches?.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                  {(!analysisResult?.keyword_matches || analysisResult.keyword_matches.length === 0) && (
                    <p className="text-slate-500 text-sm">No keywords detected</p>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult?.missing_keywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium"
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
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Improvement Suggestions
                </h2>
                <div className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg"
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
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
                data-testid="analyze-another-btn"
              >
                Analyze Another Resume
              </Button>
              <Button
                onClick={() => navigate("/resume/new")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                data-testid="create-optimized-btn"
              >
                Create Optimized Resume
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ResumeOptimizer;
