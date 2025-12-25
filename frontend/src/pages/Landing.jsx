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
  RefreshCw
} from "lucide-react";
import { Button } from "../components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Create professional resumes and cover letters with intelligent AI that understands your career goals."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "ATS Optimization",
      description: "Get instant ATS compatibility scores and suggestions to ensure your resume passes automated screening."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multiple Formats",
      description: "Export your documents in PDF, DOCX, or LaTeX format. Perfect for any application requirement."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Version Control",
      description: "Track changes, duplicate versions, and maintain a complete history of your career documents."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Improvements",
      description: "One-click fixes for common issues. Transform weak bullet points into powerful achievements."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Professional Quality",
      description: "Industry-standard formatting that recruiters love. No gimmicks, just results."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Tell us about yourself",
      description: "Share your experience, skills, and career goals through our guided chat interface."
    },
    {
      number: "02",
      title: "AI crafts your resume",
      description: "Our AI generates a tailored, ATS-friendly resume optimized for your target roles."
    },
    {
      number: "03",
      title: "Review and refine",
      description: "Edit in real-time with live preview. Get instant ATS score feedback as you refine."
    },
    {
      number: "04",
      title: "Export and apply",
      description: "Download in your preferred format and start applying with confidence."
    }
  ];

  const useCases = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Students & Fresh Graduates",
      description: "Build your first professional resume that highlights your potential, projects, and academic achievements."
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Job Seekers",
      description: "Optimize your existing resume for ATS systems and stand out in competitive job markets."
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Career Switchers",
      description: "Reframe your experience for a new industry with strategic keyword optimization."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      image: "https://images.unsplash.com/photo-1758518727592-706e80ebc354?crop=entropy&cs=srgb&fm=jpg&q=85&w=100&h=100&fit=crop",
      quote: "ATSForge helped me land interviews at top tech companies. The ATS optimization feature is a game-changer."
    },
    {
      name: "Marcus Johnson",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1752952952773-80378cefc23d?crop=entropy&cs=srgb&fm=jpg&q=85&w=100&h=100&fit=crop",
      quote: "I've tried many resume builders, but ATSForge is the only one that actually understands what recruiters want."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900" data-testid="nav-login-btn">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all" data-testid="nav-signup-btn">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">AI-Powered Resume Builder</span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Build Resumes That
                <span className="block text-gradient">Beat the ATS</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Create professional, ATS-optimized resumes and cover letters in minutes. 
                Our AI ensures your application gets past automated screening and into human hands.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate("/signup")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  data-testid="hero-cta-btn"
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-6 text-lg rounded-xl"
                  data-testid="hero-learn-more-btn"
                >
                  See How It Works
                </Button>
              </div>
              
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-slate-200">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">10,000+ professionals</p>
                  <p className="text-sm text-slate-500">have landed their dream jobs</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-slate-900 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-6 bg-indigo-100 rounded-lg w-1/3 mt-6"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                  </div>
                </div>
                
                {/* Floating ATS Score Badge */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  ATS Score: 95
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make your job application process effortless and effective.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
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
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How ATSForge Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From first draft to final application in four simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
                data-testid={`step-${index}`}
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200 -translate-x-4">
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="text-5xl font-heading font-bold text-indigo-100 mb-4">
                  {step.number}
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6 md:px-12 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Built for Every Career Stage
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Whether you're starting out or making a change, ATSForge adapts to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-indigo-500 transition-colors"
                data-testid={`use-case-${index}`}
              >
                <div className="w-14 h-14 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                  {useCase.icon}
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what our users have to say about their experience with ATSForge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-8"
                data-testid={`testimonial-${index}`}
              >
                <p className="text-lg text-slate-700 mb-6 italic">
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
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of professionals who've transformed their career with ATSForge.
          </p>
          <Button 
            onClick={() => navigate("/signup")}
            className="bg-white text-indigo-600 hover:bg-slate-100 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
            data-testid="cta-btn"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">ATSForge</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 ATSForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
