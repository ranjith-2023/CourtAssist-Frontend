// src/components/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as authService from "../../../services/authService";
import AuthLayout from "./AuthLayout";
import { PasswordInput } from "../../common/PasswordInput";
import { ToastContainer, toast } from "../../common/Toast.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: authRegister, isAuthenticated } = useAuth();

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 768;
  const isSmallMobile = windowSize.width < 480;

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    contact: "",
    password: "",
    confirmPassword: "",
    role: "user",
    advocateName: ""
  });
  
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Enhanced mobile responsive classes
  const getInputClasses = () => {
    const baseClasses = "w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b1a2e] focus:border-transparent transition-all";
    const mobileClasses = isMobile ? "px-4 py-4 text-base" : "px-4 py-3 text-sm";
    return `${baseClasses} ${mobileClasses}`;
  };

  const getButtonClasses = () => {
    const baseClasses = "w-full bg-[#0b1a2e] hover:bg-[#1e3a5c] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md";
    const mobileClasses = isMobile ? "py-4 text-base" : "py-3 text-sm";
    return `${baseClasses} ${mobileClasses}`;
  };

  const getLabelClasses = () => {
    return isMobile ? "block text-sm font-semibold mb-3 text-gray-700" : "block text-sm font-semibold mb-2 text-gray-700";
  };

  const getSectionButtonClasses = (isActive = false) => {
    const baseClasses = "flex-1 flex flex-col items-center p-4 border-2 rounded-xl transition-all duration-200";
    const activeClasses = isActive 
      ? "border-[#0b1a2e] bg-[#0b1a2e] text-white shadow-sm" 
      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800";
    return `${baseClasses} ${activeClasses}`;
  };

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: "", color: "" };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (hasLower && hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    
    if (score >= 4) return { strength: "Strong", color: "text-green-600" };
    if (score >= 3) return { strength: "Medium", color: "text-yellow-600" };
    return { strength: "Weak", color: "text-red-600" };
  };

  const validateForm = () => {
    if (!formData.username.trim()) return "Username is required";
    if (!formData.contact.trim()) return "Contact is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!isContactVerified) return "Contact must be verified";
    if (formData.role === "advocate" && !formData.advocateName.trim()) {
      return "Advocate name is required";
    }
    return null;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!formData.contact) {
      addToast("Contact (email or phone) is required.");
      return;
    }
    
    setLoading(true);
    try {
      await authService.sendContactVerificationOtp(formData.contact);
      setIsOtpSent(true);
      setResendCooldown(30);
      addToast("OTP sent successfully!", "success");
    } catch (err) {
      addToast("Failed to send OTP. " + (err.data?.error || err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      addToast("Enter the OTP.");
      return;
    }
    
    setLoading(true);
    try {
      await authService.verifyContactVerificationOtp(formData.contact, otp);
      setIsContactVerified(true);
      addToast("Contact verified successfully!", "success");
    } catch (err) {
      addToast(err.status === 401 || err.status === 400 
        ? "Invalid OTP." 
        : "Verification failed. " + (err.data?.error || err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      addToast(validationError);
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: formData.username.trim(),
        password: formData.password,
        email: formData.contact.includes("@") ? formData.contact : null,
        mobileNo: !formData.contact.includes("@") ? formData.contact : null,
        role: formData.role.toUpperCase(),
        advocateName: formData.role === "advocate" ? formData.advocateName.trim() : null
      };
      
      const result = await authRegister(userData);
      
      if (result.success) {
        addToast("Account created successfully! Redirecting...", "success");
        setTimeout(() => navigate("/home", { replace: true }), 1500);
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (err) {
      addToast("Registration failed. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const canSendOtp = formData.contact.trim().length > 0 && resendCooldown === 0 && !isContactVerified;
  const isAdvocate = formData.role === "advocate";
  const strengthInfo = passwordStrength();

  return (
    <AuthLayout type="register">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col h-full animate-slide-in-right">
        <div className="flex-1 overflow-y-auto auth-scrollbar">
          <div className={`text-center ${isMobile ? 'mb-6 mt-4' : 'mb-8'}`}>
            <h2 className={`font-bold bg-gradient-to-r from-[#0b1a2e] to-[#1e3a5c] bg-clip-text text-transparent ${
              isMobile ? 'text-2xl mb-2' : 'text-3xl mb-2'
            }`}>
              Create Account
            </h2>
            <p className="text-gray-600 text-sm">Join to Get Started</p>
          </div>

          {/* Role Selection */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-4">I am a:</label>
            <div className={`flex gap-3 ${isSmallMobile ? 'flex-col' : ''}`}>
              {[
                { value: "user", label: "User", icon: "👤", desc: "Need legal help" },
                { value: "advocate", label: "Advocate", icon: "⚖️", desc: "Provide legal services" },
              ].map(({ value, label, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange("role", value)}
                  className={getSectionButtonClasses(formData.role === value)}
                >
                  <span className={`${isMobile ? 'text-2xl' : 'text-xl'} mb-2`}>{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs opacity-80 mt-1">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advocate Name Field (Conditional) */}
          {isAdvocate && (
            <div className="mb-6">
              <label className={getLabelClasses()}>
                Full Name (as per court records)
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.advocateName}
                onChange={(e) => handleInputChange("advocateName", e.target.value)}
                className={getInputClasses()}
                required
              />
            </div>
          )}

          {/* Username */}
          <div className="mb-6">
            <label className={getLabelClasses()}>Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className={getInputClasses()}
              required
            />
          </div>

          {/* Contact Verification */}
          <div className="mb-6">
            <label className={getLabelClasses()}>
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="you@example.com or 9876543210"
              value={formData.contact}
              onChange={(e) => {
                handleInputChange("contact", e.target.value);
                setIsContactVerified(false);
                setIsOtpSent(false);
                setOtp("");
              }}
              className={getInputClasses()}
              required
            />
          </div>

          <div className={`flex gap-3 mb-6 ${isSmallMobile ? 'flex-col' : ''}`}>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!canSendOtp || loading}
              className={`px-4 rounded-lg font-semibold text-sm transition-all ${
                canSendOtp && !loading
                  ? "bg-[#0b1a2e] hover:bg-[#1e3a5c] text-white shadow-sm hover:shadow"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } ${isSmallMobile ? 'py-3' : 'py-3 flex-1'}`}
            >
              {isOtpSent ? (resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP") : "Get OTP"}
            </button>
            
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={!isOtpSent || isContactVerified || loading}
              className={`px-4 rounded-lg font-semibold text-sm transition-all ${
                isOtpSent && !isContactVerified && !loading
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } ${isSmallMobile ? 'py-3' : 'py-3 flex-1'}`}
            >
              Verify OTP
            </button>
          </div>

          {isOtpSent && !isContactVerified && (
            <div className="mb-6">
              <label className={getLabelClasses()}>OTP</label>
              <input
                type="text"
                placeholder="Enter verification code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={getInputClasses()}
                required
              />
            </div>
          )}

          {isContactVerified && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <span className="text-green-700 text-sm font-semibold flex items-center">
                <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs mr-2">✓</span>
                Contact verified successfully
              </span>
            </div>
          )}

          {/* Password Fields */}
          <div className="mb-6">
            <label className={getLabelClasses()}>Password</label>
            <PasswordInput
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Create a password"
              showPassword={false}
              setShowPassword={() => {}}
              isMobile={isMobile}
            />
            {formData.password && (
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-600">
                  Strength: <span className={`font-semibold ${strengthInfo.color}`}>{strengthInfo.strength}</span>
                </div>
                {formData.password.length < 8 && (
                  <span className="text-xs text-red-500">Min. 8 characters required</span>
                )}
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className={getLabelClasses()}>
              Confirm Password
            </label>
            <PasswordInput
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="Re-enter your password"
              showPassword={false}
              setShowPassword={() => {}}
              isMobile={isMobile}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <span className="text-xs text-red-500 mt-2 block">Passwords do not match</span>
            )}
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className={getButtonClasses()}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        <div className={`border-t border-gray-200 pt-6 mt-6 ${isMobile ? 'pb-4' : ''}`}>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login", { state: { fromAuthPage: true } })}
              className="text-[#0b1a2e] hover:text-[#1e3a5c] font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;