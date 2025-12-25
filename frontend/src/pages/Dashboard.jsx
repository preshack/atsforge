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
  User,
  TrendingUp,
  Upload,
  BarChart3,
  Zap,
  ArrowUpRight
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
import { Progress } from "../components/ui/progress";
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
    recent_cover_letters: [],
    avg_ats_score: null
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
    { icon: <Plus className="w-5 h-5" />, label: "New Resume", href: "/resume/new", primary: true },
    { icon: <Sparkles className="w-5 h-5" />, label: "Optimize", href: "/optimize" },
    { icon: <Mail className="w-5 h-5" />, label: "Cover Letter", href: "/cover-letter/new" },
    { icon: <FileText className="w-5 h-5" />, label: "My Resumes", href: "/resumes" },
    { icon: <FileCheck className="w-5 h-5" />, label: "Cover Letters", href: "/cover-letters" },
  ];

  const quickActions = [
    {
      icon: <Plus className="w-7 h-7" />,
      title: "Create Resume",
      description: "Start fresh with AI assistance",
      href: "/resume/new",
      gradient: "from-indigo-500 to-violet-500"
    },
    {
      icon: <Upload className="w-7 h-7" />,
      title: "Upload & Optimize",
      description: "Import PDF/DOCX to optimize",
      href: "/optimize",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Mail className="w-7 h-7" />,
      title: "Cover Letter",
      description: "AI-generated for any job",
      href: "/cover-letter/new",
      gradient: "from-orange-500 to-amber-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col">
        <div className="p-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.primary
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors" data-testid="user-menu-btn">
                <Avatar className="w-10 h-10 border-2 border-indigo-100">
                  <AvatarImage src={currentUser?.picture} alt={currentUser?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold">
                    {currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-900 truncate">{currentUser?.name}</p>
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

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col z-50 shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    item.primary
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
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
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="mobile-menu-btn">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </Link>
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser?.picture} alt={currentUser?.name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
              {currentUser?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </header>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Welcome back, {currentUser?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-slate-600 text-lg">
              Ready to create your next ATS-optimized resume?
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <FileText className="w-6 h-6" />, value: stats.resume_count, label: "Resumes", color: "indigo" },
              { icon: <Mail className="w-6 h-6" />, value: stats.cover_letter_count, label: "Cover Letters", color: "emerald" },
              { icon: <BarChart3 className="w-6 h-6" />, value: stats.avg_ats_score || "--", label: "Avg ATS Score", color: "violet" },
              { icon: <TrendingUp className="w-6 h-6" />, value: "∞", label: "Opportunities", color: "orange" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-${stat.color}-600 mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="font-heading text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className={`block p-6 rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group`}
                  data-testid={`quick-action-${action.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      {action.icon}
                    </div>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-1">{action.title}</h3>
                  <p className="text-white/80 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Resumes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Recent Resumes</h3>
                <Link to="/resumes" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {stats.recent_resumes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_resumes.map((resume) => (
                    <Link
                      key={resume.resume_id}
                      to={`/resume/${resume.resume_id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      data-testid={`recent-resume-${resume.resume_id}`}
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{resume.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {resume.ats_score && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          resume.ats_score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          resume.ats_score >= 60 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {resume.ats_score}%
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-4">No resumes yet</p>
                  <Link to="/resume/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" data-testid="create-first-resume-btn">
                      <Plus className="w-4 h-4 mr-2" />
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
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Recent Cover Letters</h3>
                <Link to="/cover-letters" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {stats.recent_cover_letters.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent_cover_letters.map((letter) => (
                    <Link
                      key={letter.cover_letter_id}
                      to={`/cover-letter/${letter.cover_letter_id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      data-testid={`recent-cover-letter-${letter.cover_letter_id}`}
                    >
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{letter.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(letter.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-4">No cover letters yet</p>
                  <Link to="/cover-letter/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" data-testid="create-first-cover-letter-btn">
                      <Plus className="w-4 h-4 mr-2" />
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
