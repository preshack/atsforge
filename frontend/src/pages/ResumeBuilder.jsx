import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Send,
  Loader2,
  Download,
  User,
  Sparkles,
  Save,
  Edit3,
  ChevronDown,
  Plus,
  Trash2,
  Code,
  Eye,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import { API } from "../App";

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("edit");
  const [previewTab, setPreviewTab] = useState("visual");
  const [resume, setResume] = useState(null);
  const [latexCode, setLatexCode] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm here to help you create an ATS-optimized resume. Tell me about your experience, skills, and the type of role you're targeting, and I'll help craft compelling content."
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [resumeContent, setResumeContent] = useState({
    personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", website: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: []
  });

  useEffect(() => {
    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate LaTeX when content changes
  useEffect(() => {
    generateLatex();
  }, [resumeContent]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/resumes/${resumeId}`, { withCredentials: true });
      setResume(response.data);
      setResumeContent(response.data.content);
      setLatexCode(response.data.latex_code || "");
    } catch (error) {
      toast.error("Failed to load resume");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const generateLatex = async () => {
    try {
      const response = await axios.post(`${API}/resumes/generate-latex`, {
        content: resumeContent,
        template: "modern"
      }, { withCredentials: true });
      setLatexCode(response.data.latex_code);
    } catch (error) {
      console.error("Failed to generate LaTeX:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || generating) return;

    const userMessage = { role: "user", content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setGenerating(true);

    try {
      const response = await axios.post(`${API}/resumes/generate`, {
        messages: [...messages, userMessage],
        resume_id: resumeId
      }, { withCredentials: true });

      const aiContent = response.data.content;
      setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);

      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResumeContent(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    } catch (error) {
      toast.error("Failed to generate content");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      if (resume) {
        await axios.put(`${API}/resumes/${resumeId}`, {
          title: resume.title,
          content: resumeContent
        }, { withCredentials: true });
        toast.success("Resume saved!");
      } else {
        const response = await axios.post(`${API}/resumes`, {
          title: resumeContent.personalInfo.name 
            ? `${resumeContent.personalInfo.name}'s Resume`
            : "New Resume",
          content: resumeContent
        }, { withCredentials: true });
        setResume(response.data);
        setLatexCode(response.data.latex_code);
        navigate(`/resume/${response.data.resume_id}`, { replace: true });
        toast.success("Resume created!");
      }
    } catch (error) {
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    if (!resumeId && format !== 'latex') {
      toast.error("Please save your resume first");
      return;
    }

    if (format === 'latex') {
      // Download LaTeX directly
      const blob = new Blob([latexCode], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume?.title || 'resume'}.tex`;
      link.click();
      toast.success("LaTeX file downloaded!");
      return;
    }

    try {
      const response = await axios.post(`${API}/export/${format}/${resumeId}`, {}, {
        withCredentials: true,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume?.title || 'resume'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Resume exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export resume");
    }
  };

  const handleCopyLatex = async () => {
    await navigator.clipboard.writeText(latexCode);
    setCopied(true);
    toast.success("LaTeX copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openInOverleaf = () => {
    // Create Overleaf URL with LaTeX content
    const encodedLatex = encodeURIComponent(latexCode);
    const overleafUrl = `https://www.overleaf.com/docs?snip_uri=data:text/plain;base64,${btoa(latexCode)}`;
    window.open(overleafUrl, '_blank');
  };

  const updatePersonalInfo = (field, value) => {
    setResumeContent(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateExperience = (index, field, value) => {
    setResumeContent(prev => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experience: exp };
    });
  };

  const addExperience = () => {
    setResumeContent(prev => ({
      ...prev,
      experience: [...prev.experience, { company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] }]
    }));
  };

  const removeExperience = (index) => {
    setResumeContent(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setResumeContent(prev => {
      const edu = [...prev.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...prev, education: edu };
    });
  };

  const addEducation = () => {
    setResumeContent(prev => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", field: "", graduationDate: "", gpa: "" }]
    }));
  };

  const removeEducation = (index) => {
    setResumeContent(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2" data-testid="back-to-dashboard">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-semibold text-slate-900 block">{resume?.title || "New Resume"}</span>
              <span className="text-xs text-slate-500">v{resume?.version || 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg mr-2">
            <Button
              variant={mode === "edit" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("edit")}
              className={mode === "edit" ? "bg-white shadow-sm" : ""}
              data-testid="mode-edit"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant={mode === "chat" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("chat")}
              className={mode === "chat" ? "bg-white shadow-sm" : ""}
              data-testid="mode-chat"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Chat
            </Button>
          </div>

          <Button variant="outline" onClick={handleSaveResume} disabled={saving} data-testid="save-resume-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">Save</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="export-btn">
                <Download className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Export</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("pdf")} data-testid="export-pdf">
                <FileText className="w-4 h-4 mr-2" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("docx")} data-testid="export-docx">
                <FileText className="w-4 h-4 mr-2" /> Download DOCX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("latex")} data-testid="export-latex">
                <Code className="w-4 h-4 mr-2" /> Download LaTeX (.tex)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-white">
          {mode === "chat" ? (
            <>
              <ScrollArea className="flex-1 p-4 lg:p-6">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                        message.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {generating && (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2 max-w-2xl mx-auto">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Tell me about your experience..."
                    className="flex-1 h-12"
                    disabled={generating}
                    data-testid="chat-input"
                  />
                  <Button onClick={handleSendMessage} disabled={generating || !inputMessage.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-4" data-testid="send-message-btn">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <ScrollArea className="flex-1 p-4 lg:p-6">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Personal Info */}
                <section>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-slate-600 text-sm">Full Name</Label>
                      <Input value={resumeContent.personalInfo.name} onChange={(e) => updatePersonalInfo("name", e.target.value)} placeholder="John Doe" className="mt-1" data-testid="input-name" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-slate-600 text-sm">Email</Label>
                      <Input value={resumeContent.personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} placeholder="john@example.com" className="mt-1" data-testid="input-email" />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Phone</Label>
                      <Input value={resumeContent.personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-slate-600 text-sm">Location</Label>
                      <Input value={resumeContent.personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} placeholder="San Francisco, CA" className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-slate-600 text-sm">LinkedIn URL</Label>
                      <Input value={resumeContent.personalInfo.linkedin} onChange={(e) => updatePersonalInfo("linkedin", e.target.value)} placeholder="linkedin.com/in/johndoe" className="mt-1" />
                    </div>
                  </div>
                </section>

                {/* Summary */}
                <section>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Professional Summary</h3>
                  <Textarea value={resumeContent.summary} onChange={(e) => setResumeContent(prev => ({ ...prev, summary: e.target.value }))} placeholder="A brief 2-3 sentence professional summary..." rows={4} className="text-base" data-testid="input-summary" />
                </section>

                {/* Experience */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-semibold text-slate-900">Experience</h3>
                    <Button variant="outline" size="sm" onClick={addExperience} data-testid="add-experience-btn">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  {resumeContent.experience.map((exp, index) => (
                    <div key={index} className="border border-slate-200 rounded-xl p-4 mb-4 bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-slate-500">Position {index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-slate-600 text-xs">Job Title</Label>
                          <Input value={exp.title} onChange={(e) => updateExperience(index, "title", e.target.value)} placeholder="Software Engineer" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-slate-600 text-xs">Company</Label>
                          <Input value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder="Tech Corp" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-slate-600 text-xs">Start Date</Label>
                          <Input value={exp.startDate} onChange={(e) => updateExperience(index, "startDate", e.target.value)} placeholder="Jan 2020" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-slate-600 text-xs">End Date</Label>
                          <Input value={exp.endDate} onChange={(e) => updateExperience(index, "endDate", e.target.value)} placeholder="Present" className="mt-1" />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-slate-600 text-xs">Key Achievements (one per line)</Label>
                          <Textarea value={exp.bullets?.join("\n") || ""} onChange={(e) => updateExperience(index, "bullets", e.target.value.split("\n"))} placeholder="• Led development of..." rows={4} className="mt-1 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {resumeContent.experience.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-500 mb-2">No experience added</p>
                      <Button variant="outline" size="sm" onClick={addExperience}><Plus className="w-4 h-4 mr-1" /> Add Experience</Button>
                    </div>
                  )}
                </section>

                {/* Education */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg font-semibold text-slate-900">Education</h3>
                    <Button variant="outline" size="sm" onClick={addEducation}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                  {resumeContent.education.map((edu, index) => (
                    <div key={index} className="border border-slate-200 rounded-xl p-4 mb-4 bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-slate-500">Education {index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label className="text-slate-600 text-xs">School</Label>
                          <Input value={edu.school} onChange={(e) => updateEducation(index, "school", e.target.value)} placeholder="Stanford University" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-slate-600 text-xs">Degree</Label>
                          <Input value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Bachelor's" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-slate-600 text-xs">Field</Label>
                          <Input value={edu.field} onChange={(e) => updateEducation(index, "field", e.target.value)} placeholder="Computer Science" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-slate-600 text-xs">Graduation</Label>
                          <Input value={edu.graduationDate} onChange={(e) => updateEducation(index, "graduationDate", e.target.value)} placeholder="May 2020" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Skills */}
                <section>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">Skills</h3>
                  <Textarea value={resumeContent.skills.join(", ")} onChange={(e) => setResumeContent(prev => ({ ...prev, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="JavaScript, Python, React, AWS..." rows={3} className="text-base" />
                  <p className="text-xs text-slate-500 mt-2">Separate skills with commas</p>
                </section>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden lg:flex w-1/2 bg-slate-100 flex-col">
          {/* Preview Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <Tabs value={previewTab} onValueChange={setPreviewTab} className="w-auto">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="visual" className="data-[state=active]:bg-white">
                  <Eye className="w-4 h-4 mr-1" /> Visual
                </TabsTrigger>
                <TabsTrigger value="latex" className="data-[state=active]:bg-white">
                  <Code className="w-4 h-4 mr-1" /> LaTeX
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {previewTab === "latex" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLatex}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={openInOverleaf}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open in Overleaf
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {previewTab === "visual" ? (
              <div className="w-full max-w-2xl mx-auto bg-white shadow-xl rounded-xl border border-slate-200">
                <div className="p-8">
                  {/* Visual Resume Preview */}
                  <div className="text-center mb-6 pb-6 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {resumeContent.personalInfo.name || "Your Name"}
                    </h1>
                    <p className="text-slate-600 text-sm">
                      {[resumeContent.personalInfo.email, resumeContent.personalInfo.phone, resumeContent.personalInfo.location].filter(Boolean).join(" • ") || "email@example.com • (555) 000-0000"}
                    </p>
                    {resumeContent.personalInfo.linkedin && (
                      <p className="text-indigo-600 text-sm mt-1">{resumeContent.personalInfo.linkedin}</p>
                    )}
                  </div>

                  {resumeContent.summary && (
                    <div className="mb-6">
                      <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Professional Summary</h2>
                      <p className="text-sm text-slate-700 leading-relaxed">{resumeContent.summary}</p>
                    </div>
                  )}

                  {resumeContent.experience.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Experience</h2>
                      {resumeContent.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{exp.title || "Job Title"}</p>
                              <p className="text-slate-600 text-sm">{exp.company || "Company"}</p>
                            </div>
                            <p className="text-slate-500 text-xs">{exp.startDate} - {exp.endDate || "Present"}</p>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {exp.bullets?.filter(Boolean).map((bullet, i) => (
                              <li key={i} className="text-sm text-slate-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-600">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeContent.education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Education</h2>
                      {resumeContent.education.map((edu, index) => (
                        <div key={index} className="mb-2 flex justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{edu.degree} in {edu.field}</p>
                            <p className="text-slate-600 text-sm">{edu.school}</p>
                          </div>
                          <p className="text-slate-500 text-xs">{edu.graduationDate}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeContent.skills.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeContent.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <div className="bg-slate-900 rounded-xl overflow-hidden h-full">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-400 text-xs ml-2">resume.tex</span>
                  </div>
                  <pre className="p-4 text-sm text-slate-300 overflow-auto h-[calc(100%-40px)] font-mono">
                    <code>{latexCode}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-xl shadow-lg border border-slate-200 p-1">
        <Button variant={mode === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("edit")} className={`rounded-lg ${mode === "edit" ? "bg-slate-100" : ""}`}>
          <Edit3 className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant={mode === "chat" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("chat")} className={`rounded-lg ${mode === "chat" ? "bg-slate-100" : ""}`}>
          <Sparkles className="w-4 h-4 mr-1" /> AI
        </Button>
      </div>
    </div>
  );
};

export default ResumeBuilder;
