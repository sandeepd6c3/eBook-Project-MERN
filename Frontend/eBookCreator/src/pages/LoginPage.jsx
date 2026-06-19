import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after login
  const from = location.state?.from?.pathname || "/dashboard";

  // Form State
  const [authMethod, setAuthMethod] = useState("email"); // "email" | "mobile"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobileNumber: "",
    otpCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Countdown timer for OTP resending
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Switch tabs
  const handleTabChange = (method) => {
    setAuthMethod(method);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      mobileNumber: "",
      otpCode: "",
    });
    setOtpSent(false);
    setTimer(0);
  };

  // Local Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (authMethod === "email") {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!formData.email.trim()) {
        newErrors.email = "Please enter your email";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Please enter your password";
      }
    } else {
      const cleanPhone = formData.mobileNumber.replace(/[\s\-\+]/g, "");
      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = "Please enter your mobile number";
      } else if (!/^[0-9]{10,12}$/.test(cleanPhone)) {
        newErrors.mobileNumber = "Enter a valid 10-12 digit mobile number";
      }

      if (otpSent) {
        if (!formData.otpCode.trim()) {
          newErrors.otpCode = "Please enter the verification code";
        } else if (formData.otpCode.trim().length !== 6) {
          newErrors.otpCode = "OTP must be exactly 6 digits";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send Mobile OTP
  const handleSendOTP = () => {
    const newErrors = {};
    const cleanPhone = formData.mobileNumber.replace(/[\s\-\+]/g, "");
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Please enter your mobile number";
    } else if (!/^[0-9]{10,12}$/.test(cleanPhone)) {
      newErrors.mobileNumber = "Enter a valid 10-12 digit mobile number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Sending verification code...");

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(60);
      toast.success("OTP sent successfully! Use code 123456 for testing.", {
        id: toastId,
        duration: 8000,
      });
    }, 1000);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (authMethod === "mobile" && !otpSent) {
      handleSendOTP();
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      if (authMethod === "email") {
        await login(formData.email, formData.password);
      } else {
        if (formData.otpCode.trim() !== "123456") {
          throw new Error("Invalid OTP code. Please use 123456 for testing.");
        }
        
        const mappedEmail = `${formData.mobileNumber.trim()}@mobile.com`;
        const defaultPassword = "OTP_Verified_Session_Secure_123!";
        await login(mappedEmail, defaultPassword);
      }

      toast.success("Signed in successfully!", { id: toastId });
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.success("Google Authentication is coming soon!");
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAF9] flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Centered Single-Column Container Card - max-w-[420px] */}
      <div className="w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-[24px] shadow-2xl shadow-slate-100/50 p-6 sm:p-8 transition-all duration-500 animate-fadeIn">
        <div className="w-full flex flex-col items-start text-left">
          
          {/* Header elements */}
          <h2 className="font-display font-light text-2xl sm:text-3xl text-slate-900 tracking-tight mb-1">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-[11px] sm:text-xs font-medium mb-6 leading-relaxed">
            Continue creating professional eBooks with AI.
          </p>

          {/* Authentication tabs */}
          <div className="grid grid-cols-2 gap-2 w-full mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("email")}
              className={`h-[42px] text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer border ${
                authMethod === "email"
                  ? "bg-slate-700 border-slate-700 text-white shadow-sm"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-500 hover:text-slate-700"
              }`}
            >
              EMAIL
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("mobile")}
              className={`h-[42px] text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer border ${
                authMethod === "mobile"
                  ? "bg-slate-700 border-slate-700 text-white shadow-sm"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-500 hover:text-slate-700"
              }`}
            >
              MOB.
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            
            {authMethod === "email" ? (
              <>
                {/* Email Address */}
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                  required
                />

                {/* Password */}
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={loading}
                  required
                />
              </>
            ) : (
              <>
                {/* Mobile Number */}
                <div className="w-full relative">
                  <InputField
                    label="Mobile Number"
                    name="mobileNumber"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    error={errors.mobileNumber}
                    disabled={loading || otpSent}
                    required
                  />
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setTimer(0);
                      }}
                      className="absolute right-3 top-[37px] text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider"
                    >
                      Change
                    </button>
                  )}
                </div>

                {/* OTP Code (Visible after Send OTP) */}
                {otpSent && (
                  <div className="w-full animate-fadeIn">
                    <InputField
                      label="Verification Code (OTP)"
                      name="otpCode"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={formData.otpCode}
                      onChange={handleChange}
                      error={errors.otpCode}
                      disabled={loading}
                      required
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Testing code: <strong className="text-slate-600 font-bold">123456</strong>
                      </span>
                      {timer > 0 ? (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Resend in {timer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          className="text-[10px] font-bold text-slate-800 hover:underline tracking-wide"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <Button
              disabled={loading}
              type="submit"
              variant="primary"
              className="w-full h-[50px] bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white text-[10px] font-bold tracking-wider rounded-xl transition-all duration-300 mt-2 flex items-center justify-center border-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : authMethod === "mobile" && !otpSent ? (
                "Send Verification Code"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Google Divider */}
          {!otpSent && (
            <>
              <div className="w-full flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-slate-100"></div>
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-300">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-slate-100"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full h-[50px] border border-slate-200 hover:border-slate-800 hover:bg-slate-50 active:scale-[0.99] flex items-center justify-center gap-2.5 rounded-xl transition-all duration-300 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.626 5.626 0 0 1 8.35 12.98a5.623 5.623 0 0 1 5.64-5.62c2.44 0 4.5 1.07 5.865 2.78l3.1-3.1C20.9 4.96 17.7 3.36 14 3.36c-5.87 0-10.64 4.77-10.64 10.64S8.13 24.64 14 24.64c5.78 0 10.64-4.8 10.64-10.64 0-.8-.1-1.6-.26-2.36l-12.14-.35z"
                    />
                </svg>
                <span className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">
                  Continue with Google
                </span>
              </button>
            </>
          )}

          {/* Form Footer Link */}
          <p className="text-[11px] text-slate-400 font-medium text-center w-full mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-slate-800 font-bold hover:underline ml-1"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
