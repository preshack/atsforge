import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Sparkles,
  FileCheck,
  Mail,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock,
  Target,
  User
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import axios from "axios";
import { API, useAuth } from "../App";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    resume_count: 0,
    cover_letter_count: 0,
    recent_resumes: [],
    recent_cover_letters: []
  });
  const [loading, setLoading] = useState(true);

  const currentUser = location.state?.user || user;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { icon: <Plus className="w-5 h-5" />, label: "Create Resume", href: "/resume/new", primary: true },
    { icon: <Sparkles className="w-5 h-5" />, label: "Optimize Resume", href: "/optimize" },
    { icon: <Mail className="w-5 h-5" />, label: "Cover Letter", href: "/cover-letter/new" },
    { icon: <History className="w-5 h-5" />, label: "My Resumes", href: "/resumes" },
    { icon: <FileCheck className="w-5 h-5" />, label: "Cover Letters", href: "/cover-letters" },
  ];

  const quickActions = [
    {
      icon: <Plus className="w-8 h-8" />,
      title: "Create Resume",
      description: "Start building a new ATS-friendly resume with AI assistance",
      href: "/resume/new",
      color: "bg-indigo-600 hover:bg-indigo-700"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Optimize Resume",
      description: "Upload and optimize your existing resume for ATS",
      href: "/optimize",
      color: "bg-violet-600 hover:bg-violet-700"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Cover Letter",
      description: "Generate a tailored cover letter for any job",
      href: "/cover-letter/new",
      color: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.primary
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors" data-testid="user-menu-btn">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser?.picture} alt={currentUser?.name} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-600"
                onClick={handleLogout}
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-50">
            <div className="p-6 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.primary
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2" data-testid="mobile-menu-btn">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </Link>
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser?.picture} alt={currentUser?.name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {currentUser?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </header>

        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {currentUser?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-slate-600">
              Ready to create your next ATS-optimized resume?
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <FileText className="w-8 h-8 text-indigo-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.resume_count}</p>
              <p className="text-sm text-slate-500">Resumes</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <Mail className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.cover_letter_count}</p>
              <p className="text-sm text-slate-500">Cover Letters</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <Target className="w-8 h-8 text-violet-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-sm text-slate-500">Avg ATS Score</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <Clock className="w-8 h-8 text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-sm text-slate-500">Applications</p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 5) }}
              >
                <Link
                  to={action.href}
                  className={`block p-6 rounded-xl text-white ${action.color} transition-all hover:-translate-y-1 hover:shadow-lg`}
                  data-testid={`quick-action-${action.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {action.icon}
                  <h3 className="font-heading text-lg font-semibold mt-4 mb-1">{action.title}</h3>
                  <p className="text-white/80 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Resumes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Recent Resumes</h3>
                <Link to="/resumes" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {stats.recent_resumes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_resumes.map((resume) => (
                    <Link
                      key={resume.resume_id}
                      to={`/resume/${resume.resume_id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid={`recent-resume-${resume.resume_id}`}
                    >
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{resume.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {resume.ats_score && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          ATS: {resume.ats_score}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No resumes yet</p>
                  <Link to="/resume/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="create-first-resume-btn">
                      Create your first resume
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Recent Cover Letters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Recent Cover Letters</h3>
                <Link to="/cover-letters" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {stats.recent_cover_letters.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_cover_letters.map((letter) => (
                    <Link
                      key={letter.cover_letter_id}
                      to={`/cover-letter/${letter.cover_letter_id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid={`recent-cover-letter-${letter.cover_letter_id}`}
                    >
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{letter.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(letter.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No cover letters yet</p>
                  <Link to="/cover-letter/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="create-first-cover-letter-btn">
                      Create your first cover letter
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
