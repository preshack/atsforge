import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Send,
  Loader2,
  Download,
  RefreshCw,
  User,
  Sparkles,
  Save,
  Eye,
  Edit3,
  ChevronDown
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
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
  const [mode, setMode] = useState("chat"); // chat or edit
  const [resume, setResume] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm here to help you create an ATS-optimized resume. Let's start with some basic information.\n\nWhat's your full name and what kind of role are you targeting?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [resumeContent, setResumeContent] = useState({
    personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: []
  });

  useEffect(() => {
    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/resumes/${resumeId}`, {
        withCredentials: true
      });
      setResume(response.data);
      setResumeContent(response.data.content);
      setMode("edit");
    } catch (error) {
      toast.error("Failed to load resume");
      navigate("/dashboard");
    } finally {
      setLoading(false);
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
      }, {
        withCredentials: true
      });

      const aiContent = response.data.content;
      setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);

      // Try to parse JSON content from the response
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResumeContent(prev => ({
            ...prev,
            ...parsed
          }));
        }
      } catch (e) {
        // Not JSON, that's okay
      }
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
        // Update existing
        await axios.put(`${API}/resumes/${resumeId}`, {
          title: resume.title,
          content: resumeContent
        }, {
          withCredentials: true
        });
        toast.success("Resume saved!");
      } else {
        // Create new
        const response = await axios.post(`${API}/resumes`, {
          title: resumeContent.personalInfo.name 
            ? `${resumeContent.personalInfo.name}'s Resume`
            : "New Resume",
          content: resumeContent
        }, {
          withCredentials: true
        });
        setResume(response.data);
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
    if (!resumeId) {
      toast.error("Please save your resume first");
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
      experience: [...prev.experience, {
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [""]
      }]
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
      education: [...prev.education, {
        school: "",
        degree: "",
        field: "",
        graduationDate: "",
        gpa: ""
      }]
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
            <span className="font-heading font-semibold text-slate-900">
              {resume?.title || "New Resume"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 mr-4">
            <Button
              variant={mode === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("chat")}
              className={mode === "chat" ? "bg-indigo-600" : ""}
              data-testid="mode-chat"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Chat
            </Button>
            <Button
              variant={mode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("edit")}
              className={mode === "edit" ? "bg-indigo-600" : ""}
              data-testid="mode-edit"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleSaveResume}
            disabled={saving}
            data-testid="save-resume-btn"
          >
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
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("docx")} data-testid="export-docx">
                Download DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat or Edit */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-white">
          {mode === "chat" ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                          message.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {generating && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2 max-w-2xl mx-auto">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Tell me about your experience..."
                    className="flex-1"
                    disabled={generating}
                    data-testid="chat-input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={generating || !inputMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    data-testid="send-message-btn"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-slate-900">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={resumeContent.personalInfo.name}
                        onChange={(e) => updatePersonalInfo("name", e.target.value)}
                        placeholder="John Doe"
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={resumeContent.personalInfo.email}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        placeholder="john@example.com"
                        data-testid="input-email"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={resumeContent.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        data-testid="input-phone"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={resumeContent.personalInfo.location}
                        onChange={(e) => updatePersonalInfo("location", e.target.value)}
                        placeholder="San Francisco, CA"
                        data-testid="input-location"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>LinkedIn URL</Label>
                      <Input
                        value={resumeContent.personalInfo.linkedin}
                        onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/johndoe"
                        data-testid="input-linkedin"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-slate-900">Professional Summary</h3>
                  <Textarea
                    value={resumeContent.summary}
                    onChange={(e) => setResumeContent(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="A brief professional summary..."
                    rows={4}
                    data-testid="input-summary"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg text-slate-900">Experience</h3>
                    <Button variant="outline" size="sm" onClick={addExperience} data-testid="add-experience-btn">
                      Add Experience
                    </Button>
                  </div>
                  {resumeContent.experience.map((exp, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Job Title</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(index, "title", e.target.value)}
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            placeholder="Tech Corp"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                            placeholder="Jan 2020"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                            placeholder="Present"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Responsibilities & Achievements</Label>
                        <Textarea
                          value={exp.bullets?.join("\n") || ""}
                          onChange={(e) => updateExperience(index, "bullets", e.target.value.split("\n"))}
                          placeholder="• Led development of..."
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg text-slate-900">Education</h3>
                    <Button variant="outline" size="sm" onClick={addEducation} data-testid="add-education-btn">
                      Add Education
                    </Button>
                  </div>
                  {resumeContent.education.map((edu, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>School</Label>
                          <Input
                            value={edu.school}
                            onChange={(e) => updateEducation(index, "school", e.target.value)}
                            placeholder="University of..."
                          />
                        </div>
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            placeholder="Bachelor's"
                          />
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(index, "field", e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <Label>Graduation Date</Label>
                          <Input
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(index, "graduationDate", e.target.value)}
                            placeholder="May 2020"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-slate-900">Skills</h3>
                  <Textarea
                    value={resumeContent.skills.join(", ")}
                    onChange={(e) => setResumeContent(prev => ({
                      ...prev,
                      skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="JavaScript, Python, React, AWS..."
                    rows={3}
                    data-testid="input-skills"
                  />
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden lg:flex w-1/2 bg-slate-100 p-6 overflow-auto">
          <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
            <div className="p-8">
              {/* Resume Preview */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  {resumeContent.personalInfo.name || "Your Name"}
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  {[
                    resumeContent.personalInfo.email,
                    resumeContent.personalInfo.phone,
                    resumeContent.personalInfo.location
                  ].filter(Boolean).join(" | ") || "email@example.com | (555) 000-0000 | City, State"}
                </p>
                {resumeContent.personalInfo.linkedin && (
                  <p className="text-indigo-600 text-sm">{resumeContent.personalInfo.linkedin}</p>
                )}
              </div>

              {resumeContent.summary && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                    Professional Summary
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed">{resumeContent.summary}</p>
                </div>
              )}

              {resumeContent.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                    Experience
                  </h2>
                  {resumeContent.experience.map((exp, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{exp.title || "Job Title"}</p>
                          <p className="text-sm text-slate-600">{exp.company || "Company"}</p>
                        </div>
                        <p className="text-sm text-slate-500">
                          {exp.startDate} - {exp.endDate || "Present"}
                        </p>
                      </div>
                      {exp.bullets?.filter(Boolean).map((bullet, i) => (
                        <p key={i} className="text-sm text-slate-700 mt-1 pl-4">• {bullet}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {resumeContent.education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                    Education
                  </h2>
                  {resumeContent.education.map((edu, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {edu.degree} in {edu.field}
                          </p>
                          <p className="text-sm text-slate-600">{edu.school}</p>
                        </div>
                        <p className="text-sm text-slate-500">{edu.graduationDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {resumeContent.skills.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                    Skills
                  </h2>
                  <p className="text-sm text-slate-700">{resumeContent.skills.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile mode toggle */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-full shadow-lg border border-slate-200 p-1">
        <Button
          variant={mode === "chat" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("chat")}
          className={`rounded-full ${mode === "chat" ? "bg-indigo-600" : ""}`}
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Chat
        </Button>
        <Button
          variant={mode === "edit" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("edit")}
          className={`rounded-full ${mode === "edit" ? "bg-indigo-600" : ""}`}
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
};

export default ResumeBuilder;
