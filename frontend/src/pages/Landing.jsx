import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  Target, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Users,
  GraduationCap,
  Briefcase,
  RefreshCw,
  Upload,
  Star,
  BarChart3,
  FileCheck,
  Layers,
  TrendingUp
} from "lucide-react";
import { Button } from "../components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Writing",
      description: "Smart AI that understands your career goals and crafts compelling bullet points with quantified achievements.",
      gradient: "from-indigo-500 to-violet-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "ATS Score Analysis",
      description: "Real-time ATS compatibility scoring with detailed keyword analysis and improvement suggestions.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Upload className="w-6 h-6" />,
      title: "PDF/DOCX Import",
      description: "Upload your existing resume in PDF or DOCX format and instantly optimize it for ATS systems.",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Multiple Templates",
      description: "Choose from professional templates designed to pass ATS while looking stunning to human recruiters.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Version Control",
      description: "Track changes, duplicate versions, and maintain multiple resumes tailored for different roles.",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Export Anywhere",
      description: "Download as PDF, DOCX, or plain text. Perfect formatting guaranteed for any application system.",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload or Start Fresh",
      description: "Import your existing resume or build from scratch using our AI-guided process.",
      icon: <Upload className="w-8 h-8" />
    },
    {
      number: "02",
      title: "AI Enhancement",
      description: "Our AI analyzes and improves your content with powerful action verbs and metrics.",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      number: "03",
      title: "ATS Optimization",
      description: "Get real-time scoring and keyword suggestions based on your target job description.",
      icon: <BarChart3 className="w-8 h-8" />
    },
    {
      number: "04",
      title: "Export & Apply",
      description: "Download in multiple formats and start applying with confidence.",
      icon: <Download className="w-8 h-8" />
    }
  ];

  const stats = [
    { value: "98%", label: "ATS Pass Rate" },
    { value: "50K+", label: "Resumes Created" },
    { value: "3x", label: "More Interviews" },
    { value: "4.9/5", label: "User Rating" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      quote: "ATSForge helped me land interviews at 5 FAANG companies. The ATS optimization is incredible - my response rate went from 5% to 40%.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Marketing Director",
      company: "Salesforce",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      quote: "The AI suggestions transformed my bullet points from generic to compelling. I got a 30% salary increase at my new role.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      company: "Meta",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      quote: "As a career switcher, ATSForge helped me highlight transferable skills. Landed my dream PM role in 6 weeks.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Features
              </button>
              <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                How It Works
              </button>
              <button onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Testimonials
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium" data-testid="nav-login-btn">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all" data-testid="nav-signup-btn">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-10 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">AI-Powered Resume Builder</span>
              </div>
              
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                Resumes That
                <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Beat Every ATS
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-lg">
                Create professional, ATS-optimized resumes in minutes. Our AI ensures your application 
                passes automated screening and lands on recruiters' desks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button 
                  onClick={() => navigate("/signup")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 group"
                  data-testid="hero-cta-btn"
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-8 py-6 text-lg rounded-xl"
                  data-testid="hero-learn-more-btn"
                >
                  See How It Works
                </Button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Resume Preview Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-2xl opacity-20 transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* Window Controls */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="ml-4 text-xs text-slate-400 font-medium">resume_final.pdf</span>
                  </div>
                  
                  {/* Mock Resume Content */}
                  <div className="space-y-4">
                    <div className="h-8 bg-slate-900 rounded-lg w-48"></div>
                    <div className="h-3 bg-slate-200 rounded w-72"></div>
                    <div className="h-3 bg-slate-200 rounded w-64"></div>
                    
                    <div className="pt-4">
                      <div className="h-5 bg-indigo-100 rounded w-32 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-3 bg-slate-100 rounded w-11/12"></div>
                        <div className="h-3 bg-slate-100 rounded w-10/12"></div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="h-5 bg-indigo-100 rounded w-28 mb-3"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                        <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                        <div className="h-6 bg-slate-100 rounded-full w-24"></div>
                        <div className="h-6 bg-slate-100 rounded-full w-18"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ATS Score Badge */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">ATS Score: 95</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-6 lg:px-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-slate-500 mb-8 font-medium">TRUSTED BY PROFESSIONALS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'].map((company) => (
              <span key={company} className="text-xl font-bold text-slate-400">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Features</span>
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
                Everything You Need to Land Your Dream Job
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Powerful features designed to make your job application process effortless and effective.
              </p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
              Four Steps to Your Perfect Resume
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From first draft to job offer in record time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="relative"
                data-testid={`step-${index}`}
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                )}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500 transition-colors">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white mb-5">
                    {step.icon}
                  </div>
                  <div className="text-5xl font-bold text-slate-700 mb-3">{step.number}</div>
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
              Loved by Job Seekers Worldwide
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow"
                data-testid={`testimonial-${index}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join 50,000+ professionals who've transformed their careers with ATSForge. 
              Start building your perfect resume today.
            </p>
            <Button 
              onClick={() => navigate("/signup")}
              className="bg-white text-indigo-600 hover:bg-slate-100 px-10 py-7 text-lg rounded-xl shadow-2xl font-semibold group"
              data-testid="cta-btn"
            >
              Get Started Free - No Credit Card
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">ATSForge</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 ATSForge. All rights reserved. Built with love for job seekers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
