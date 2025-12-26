// src/components/pages/auth/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as authService from "../../../services/authService";
import AuthLayout from "./AuthLayout";
import { PasswordInput } from "../../common/PasswordInput";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authLoading } = useAuth();

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

  // Modes
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState("sendOtp");

  // Shared
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP / reset
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from || "/home";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Enhanced mobile input classes
  const getInputClasses = () => {
    const baseClasses = "w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b1a2e] focus:border-transparent transition-all";
    const mobileClasses = isMobile ? "px-4 py-4 text-base" : "px-3 py-2 text-sm";
    return `${baseClasses} ${mobileClasses}`;
  };

  const getButtonClasses = () => {
    const baseClasses = "w-full bg-[#0b1a2e] hover:bg-[#1e3a5c] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md";
    const mobileClasses = isMobile ? "py-4 text-base" : "py-2 text-sm";
    return `${baseClasses} ${mobileClasses}`;
  };

  const getLabelClasses = () => {
    return isMobile ? "block text-sm font-semibold mb-3 text-gray-700" : "block text-sm font-semibold mb-1 text-gray-700";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!identifier.trim()) {
        throw new Error("Please enter your username, email, or mobile number");
      }
      
      if (!password) {
        throw new Error("Please enter your password");
      }

      const result = await login(identifier, password, rememberMe);
      
      if (result.success) {
        console.log("Login successful");
      } else {
        if (result.status === 401) {
          setError("Invalid credentials. Please check your login information and try again.");
        } else if (result.status === 404) {
          setError("Account not found. Please check your information or sign up.");
        } else if (result.error.includes("network") || result.error.includes("timeout")) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(result.error || "Login failed. Please try again.");
        }
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      let errorMessage = err.message || "Login failed. Try again.";
      
      if (err.message.includes("401") || err.message.includes("Invalid credentials")) {
        errorMessage = "Invalid credentials. Please check your login information and try again.";
      } else if (err.message.includes("404") || err.message.includes("not found")) {
        errorMessage = "Account not found. Please check your information or sign up.";
      } else if (err.message.includes("network") || err.message.includes("timeout")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setError(errorMessage);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!contact) {
      setError("Please enter your email or mobile number");
      return;
    }
    
    setLoading(true);
    try {
      await authService.sendPasswordResetOtp(contact);
      setStep("verifyOtp");
      alert("OTP sent to your registered email or mobile number.");
    } catch (err) {
      if (err.status === 404) {
        setError("Account not found. Please check your email or mobile number.");
      } else {
        setError("Failed to send OTP. " + (err.data?.error || err.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp) {
      setError("Please enter OTP");
      return;
    }
    setLoading(true);
    try {
      await authService.verifyPasswordResetOtp(contact, otp);
      setIsOtpVerified(true);
      setStep("resetPassword");
      alert("OTP verified. Please set your new password.");
    } catch (err) {
      if (err.status === 401) {
        setError("Invalid OTP. Please try again.");
      } else {
        setError("Verification failed. " + (err.data?.error || err.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!isOtpVerified) {
      setError("OTP not verified yet.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!newPassword) {
      setError("Password cannot be empty.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(contact, newPassword);
      alert("Password reset successful. Please login with your new password.");
      setIsForgotPassword(false);
      setStep("sendOtp");
      setContact("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setIsOtpVerified(false);
    } catch (err) {
      setError("Reset failed. " + (err.data?.error || err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate("/register", { state: { fromAuthPage: true } });
  };

  return (
    <AuthLayout type="login">
      <div className="flex flex-col h-full animate-slide-in-left">
        <div className="flex-1">
          <h2 className={`text-center font-bold mb-6 ${isMobile ? 'text-2xl mt-4' : 'text-2xl'}`}>
            {!isForgotPassword
              ? "Login to Your Account"
              : step === "sendOtp"
              ? "Reset Your Password"
              : step === "verifyOtp"
              ? "Verify OTP"
              : "Set New Password"}
          </h2>

          {error && (
            <div className={`bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4 flex items-center ${
              isMobile ? 'px-4 py-3 text-base' : 'px-4 py-3 text-sm'
            }`}>
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {!isForgotPassword && (
            <form
              onSubmit={handleLogin}
              className={`space-y-4 ${shake ? "animate-shake" : ""}`}
              noValidate
            >
              <div>
                <label className={getLabelClasses()}>
                  Username, Email or Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your username, email or mobile"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  className={`${getInputClasses()} ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can login with your username, email address, or mobile number
                </p>
              </div>

              <div>
                <label className={getLabelClasses()}>
                  Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  error={error}
                  isMobile={isMobile}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-3 w-4 h-4 text-[#0b1a2e] focus:ring-[#0b1a2e] border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setStep("sendOtp");
                    setError("");
                  }}
                  className="text-sm text-[#0b1a2e] underline hover:text-[#1e3a5c] font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className={getButtonClasses()}
              >
                {loading || authLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {isForgotPassword && step === "sendOtp" && (
            <form onSubmit={handleSendOtp} noValidate className="space-y-4">
              <div>
                <label className={getLabelClasses()}>
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your registered email or mobile"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    setError("");
                  }}
                  className={getInputClasses()}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  We'll send OTP to your registered email or mobile number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={getButtonClasses()}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                }}
                className="w-full text-sm text-[#0b1a2e] underline hover:text-[#1e3a5c] font-medium mt-2 text-center"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {isForgotPassword && step === "verifyOtp" && (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
              <div>
                <label className={getLabelClasses()}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={getInputClasses()}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Check your email or SMS for the OTP
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={getButtonClasses()}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("sendOtp");
                  setError("");
                }}
                className="w-full text-sm text-[#0b1a2e] underline hover:text-[#1e3a5c] font-medium mt-2 text-center"
              >
                ← Back
              </button>
            </form>
          )}

          {isForgotPassword && step === "resetPassword" && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-4">
              <div>
                <label className={getLabelClasses()}>
                  New Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  showPassword={showNewPassword}
                  setShowPassword={setShowNewPassword}
                  isMobile={isMobile}
                />
              </div>

              <div>
                <label className={getLabelClasses()}>
                  Confirm New Password
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  isMobile={isMobile}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={getButtonClasses()}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("verifyOtp");
                  setError("");
                }}
                className="w-full text-sm text-[#0b1a2e] underline hover:text-[#1e3a5c] font-medium mt-2 text-center"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        {!isForgotPassword && (
          <div className={`border-t border-gray-200 pt-4 mt-6 ${isMobile ? 'pb-4' : ''}`}>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={handleSignUpClick}
                className="text-[#0b1a2e] underline font-semibold hover:text-[#1e3a5c] transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default LoginPage;