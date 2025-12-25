import { useState, useEffect, useRef, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import ResumeHistory from "./pages/ResumeHistory";
import CoverLetterHistory from "./pages/CoverLetterHistory";

import "@/index.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Auth Callback Component - handles Google OAuth redirect
const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const location = useLocation();

  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        navigate("/login", { replace: true });
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const response = await axios.post(`${API}/auth/session`, 
          { session_id: sessionId },
          { withCredentials: true }
        );

        const userData = response.data;
        
        if (userData.onboarding_completed) {
          navigate("/dashboard", { state: { user: userData }, replace: true });
        } else {
          navigate("/onboarding", { state: { user: userData }, replace: true });
        }
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login", { replace: true });
      }
    };

    processSession();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isAuthenticated: location.state?.user ? true : null,
    user: location.state?.user || null,
    isLoading: !location.state?.user
  });

  useEffect(() => {
    if (location.state?.user) return;

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          isLoading: false
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [location.state, navigate]);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  return children;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser: login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// App Router
function AppRouter() {
  const location = useLocation();

  // Check for session_id in URL fragment synchronously (NOT in useEffect)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/resume/new" element={
        <ProtectedRoute>
          <ResumeBuilder />
        </ProtectedRoute>
      } />
      <Route path="/resume/:resumeId" element={
        <ProtectedRoute>
          <ResumeBuilder />
        </ProtectedRoute>
      } />
      <Route path="/optimize" element={
        <ProtectedRoute>
          <ResumeOptimizer />
        </ProtectedRoute>
      } />
      <Route path="/cover-letter/new" element={
        <ProtectedRoute>
          <CoverLetterGenerator />
        </ProtectedRoute>
      } />
      <Route path="/cover-letter/:id" element={
        <ProtectedRoute>
          <CoverLetterGenerator />
        </ProtectedRoute>
      } />
      <Route path="/resumes" element={
        <ProtectedRoute>
          <ResumeHistory />
        </ProtectedRoute>
      } />
      <Route path="/cover-letters" element={
        <ProtectedRoute>
          <CoverLetterHistory />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
