import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Globe, 
  Palette,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { API } from "../App";

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    experience_level: "",
    industry: "",
    target_roles: [],
    country: "",
    resume_style: ""
  });

  const totalSteps = 5;

  const experienceLevels = [
    { value: "student", label: "Student / Fresh Graduate", icon: <GraduationCap className="w-6 h-6" /> },
    { value: "entry", label: "Entry Level (0-2 years)", icon: <Briefcase className="w-6 h-6" /> },
    { value: "mid", label: "Mid Level (3-5 years)", icon: <Briefcase className="w-6 h-6" /> },
    { value: "senior", label: "Senior Level (6-10 years)", icon: <Briefcase className="w-6 h-6" /> },
    { value: "executive", label: "Executive (10+ years)", icon: <Briefcase className="w-6 h-6" /> }
  ];

  const industries = [
    "Technology", "Finance", "Healthcare", "Education", "Marketing",
    "Engineering", "Design", "Sales", "Consulting", "Legal",
    "Manufacturing", "Retail", "Real Estate", "Media", "Non-profit"
  ];

  const targetRolesOptions = [
    "Software Engineer", "Data Scientist", "Product Manager", "Designer",
    "Marketing Manager", "Sales Representative", "Project Manager",
    "Business Analyst", "HR Manager", "Operations Manager",
    "Financial Analyst", "Content Writer", "DevOps Engineer"
  ];

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "India", "Singapore", "Netherlands", "Sweden",
    "Japan", "Brazil", "UAE", "Ireland", "New Zealand"
  ];

  const resumeStyles = [
    { value: "modern", label: "Modern & Clean", description: "Minimalist design with clear sections" },
    { value: "professional", label: "Traditional Professional", description: "Classic format preferred by corporations" },
    { value: "creative", label: "Creative & Bold", description: "Unique layout that stands out" },
    { value: "technical", label: "Technical Focus", description: "Emphasis on skills and projects" }
  ];

  const handleSelect = (field, value) => {
    if (field === "target_roles") {
      const current = formData.target_roles;
      if (current.includes(value)) {
        setFormData({ ...formData, target_roles: current.filter(r => r !== value) });
      } else if (current.length < 3) {
        setFormData({ ...formData, target_roles: [...current, value] });
      }
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.experience_level !== "";
      case 2: return formData.industry !== "";
      case 3: return formData.target_roles.length > 0;
      case 4: return formData.country !== "";
      case 5: return formData.resume_style !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/users/onboarding`, formData, {
        withCredentials: true
      });
      toast.success("Welcome to ATSForge!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                What's your experience level?
              </h2>
              <p className="text-slate-600">This helps us tailor resume suggestions for your career stage.</p>
            </div>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleSelect("experience_level", level.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    formData.experience_level === level.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  data-testid={`experience-${level.value}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.experience_level === level.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {level.icon}
                  </div>
                  <span className={`font-medium ${
                    formData.experience_level === level.value ? "text-indigo-900" : "text-slate-700"
                  }`}>
                    {level.label}
                  </span>
                  {formData.experience_level === level.value && (
                    <Check className="w-5 h-5 text-indigo-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                What industry are you in?
              </h2>
              <p className="text-slate-600">We'll optimize your resume with industry-specific keywords.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleSelect("industry", industry)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.industry === industry
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                  data-testid={`industry-${industry.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                What roles are you targeting?
              </h2>
              <p className="text-slate-600">Select up to 3 roles you're interested in.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {targetRolesOptions.map((role) => (
                <button
                  key={role}
                  onClick={() => handleSelect("target_roles", role)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-between ${
                    formData.target_roles.includes(role)
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                  data-testid={`role-${role.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {role}
                  {formData.target_roles.includes(role) && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 text-center">
              Selected: {formData.target_roles.length}/3
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                Where are you job hunting?
              </h2>
              <p className="text-slate-600">Resume formats vary by region. We'll optimize accordingly.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleSelect("country", country)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.country === country
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                  data-testid={`country-${country.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Palette className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                Choose your resume style
              </h2>
              <p className="text-slate-600">You can always change this later.</p>
            </div>
            <div className="space-y-3">
              {resumeStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleSelect("resume_style", style.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.resume_style === style.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  data-testid={`style-${style.value}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        formData.resume_style === style.value ? "text-indigo-900" : "text-slate-700"
                      }`}>
                        {style.label}
                      </p>
                      <p className="text-sm text-slate-500">{style.description}</p>
                    </div>
                    {formData.resume_style === style.value && (
                      <Check className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900">ATSForge</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-slate-500">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2"
            data-testid="onboarding-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              data-testid="onboarding-next-btn"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              data-testid="onboarding-complete-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
