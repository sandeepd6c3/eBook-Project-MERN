import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);

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

  // Google OAuth states
  const [showGoogleMockModal, setShowGoogleMockModal] = useState(false);
  const [customMockGoogle, setCustomMockGoogle] = useState({
    name: "",
    email: "",
  });

  // Dynamically load Google Identity Services script
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID") {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
        }
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    const toastId = toast.loading("Connecting to Google...");
    try {
      await googleLogin({ token: response.credential });
      toast.success("Signed in with Google successfully!", { id: toastId });
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Google Login failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async (mockData) => {
    setLoading(true);
    setShowGoogleMockModal(false);
    const toastId = toast.loading("Simulating Google Login...");
    try {
      await googleLogin({ isMock: true, mockPayload: mockData });
      toast.success("Successfully authenticated via Google Demo!", { id: toastId });
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Mock Google Login failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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
    setShowPassword(false);
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
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID" && window.google) {
      window.google.accounts.id.prompt();
    } else {
      setShowGoogleMockModal(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-tertiary flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-250">
      {/* Centered Single-Column Container Card - max-w-[420px] */}
      <div className="w-full max-w-[420px] bg-bg-primary border border-border-primary rounded-[24px] shadow-2xl shadow-slate-900/[0.02] p-8 sm:p-10 transition-all duration-500 animate-fadeIn">
        <div className="w-full flex flex-col items-center">
          
          {/* Header elements (Centered per template) */}
          <div className="w-full flex flex-col items-center text-center mb-8">
            <div className="relative inline-block">
              {/* Soft purple dot overlapping Log In title */}
              <span className="absolute -left-2.5 top-1.5 w-6 h-6 rounded-full bg-brand-purple/25 -z-10 animate-pulse"></span>
              <h2 className="font-display font-bold text-3xl text-text-primary tracking-tight relative z-10">
                Log In
              </h2>
            </div>
            <p className="text-text-secondary text-xs mt-2 font-medium">
              Welcome back! Please enter your details
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            
            {authMethod === "email" ? (
              <>
                {/* Email Address */}
                <div className="w-full flex flex-col items-start gap-1">
                  <label className="text-[12px] font-bold text-text-primary">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full h-[46px] px-4 bg-bg-secondary text-text-primary border ${
                      errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-200/30" : "border-border-primary focus:border-brand-purple focus:ring-brand-purple/20"
                    } rounded-[10px] text-xs font-sans placeholder-text-muted focus:ring-1 outline-none transition-all duration-300 disabled:bg-bg-tertiary disabled:text-text-muted`}
                    required
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="w-full flex flex-col items-start gap-1">
                  <label className="text-[12px] font-bold text-text-primary">
                    Password
                  </label>
                  <div className="w-full relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full h-[46px] pl-4 pr-11 bg-bg-secondary text-text-primary border ${
                        errors.password ? "border-red-400 focus:border-red-500 focus:ring-red-200/30" : "border-border-primary focus:border-brand-purple focus:ring-brand-purple/20"
                      } rounded-[10px] text-xs font-sans placeholder-text-muted focus:ring-1 outline-none transition-all duration-300 disabled:bg-bg-tertiary disabled:text-text-muted`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-[50%] -translate-y-[50%] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.0" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.0" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">
                      {errors.password}
                    </p>
                  )}
                  {/* forgot password ? Link positioned left below inputs */}
                  <div className="w-full text-left mt-1.5 pl-0.5">
                    <Link
                      to="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        toast("Demo System: Passwords can be reset via the Google Mock simulator if credentials are lost.", { icon: "💡" });
                      }}
                      className="text-brand-purple hover:text-purple-600 font-semibold text-[11px] hover:underline"
                    >
                      forgot password ?
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Mobile Number */}
                <div className="w-full flex flex-col items-start gap-1">
                  <label className="text-[12px] font-bold text-text-primary">
                    Mobile Number
                  </label>
                  <div className="w-full relative">
                    <input
                      type="tel"
                      name="mobileNumber"
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      disabled={loading || otpSent}
                      className={`w-full h-[46px] pl-4 pr-16 bg-bg-secondary text-text-primary border ${
                        errors.mobileNumber ? "border-red-400 focus:border-red-500 focus:ring-red-200/30" : "border-border-primary focus:border-brand-purple focus:ring-brand-purple/20"
                      } rounded-[10px] text-xs font-sans placeholder-text-muted focus:ring-1 outline-none transition-all duration-300 disabled:bg-bg-tertiary disabled:text-text-muted`}
                      required
                    />
                    {otpSent && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setTimer(0);
                        }}
                        className="absolute right-3.5 top-[50%] -translate-y-[50%] text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {errors.mobileNumber && (
                    <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* OTP Code (Visible after Send OTP) */}
                {otpSent && (
                  <div className="w-full flex flex-col items-start gap-1 animate-fadeIn">
                    <label className="text-[12px] font-bold text-text-primary">
                      Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      name="otpCode"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={formData.otpCode}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full h-[46px] px-4 bg-bg-secondary text-text-primary border ${
                        errors.otpCode ? "border-red-400 focus:border-red-500 focus:ring-red-200/30" : "border-border-primary focus:border-brand-purple focus:ring-brand-purple/20"
                      } rounded-[10px] text-xs font-sans placeholder-text-muted focus:ring-1 outline-none transition-all duration-300 disabled:bg-bg-tertiary disabled:text-text-muted`}
                      required
                    />
                    {errors.otpCode && (
                      <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">
                        {errors.otpCode}
                      </p>
                    )}
                    <div className="flex justify-between items-center w-full mt-2 px-1">
                      <span className="text-[10px] text-text-muted font-medium">
                        Testing code: <strong className="text-text-secondary font-bold">123456</strong>
                      </span>
                      {timer > 0 ? (
                        <span className="text-[10px] text-text-muted font-medium">
                          Resend in {timer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          className="text-[10px] font-bold text-text-primary hover:underline tracking-wide cursor-pointer"
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
              className="w-full h-[48px] bg-brand-purple hover:bg-purple-700 active:scale-[0.99] text-white text-xs font-bold rounded-[10px] transition-all duration-300 mt-2 flex items-center justify-center border-none cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : authMethod === "mobile" && !otpSent ? (
                "Send Verification Code"
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          {/* Or Continue With Divider */}
          {!otpSent && (
            <>
              <div className="w-full flex items-center gap-3 my-6">
                <div className="flex-1 h-[1px] bg-border-primary"></div>
                <span className="text-[10px] font-semibold text-text-muted">
                  Or Continue With
                </span>
                <div className="flex-1 h-[1px] bg-border-primary"></div>
              </div>

              {/* OAuth buttons side-by-side: Google & Mob. Num. (or Email) */}
              <div className="w-full flex gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  type="button"
                  className="flex-1 h-[48px] border border-border-primary hover:border-text-primary hover:bg-bg-secondary active:scale-[0.99] flex items-center justify-center gap-2 rounded-[10px] transition-all duration-300 cursor-pointer text-text-primary bg-bg-primary"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.626 5.626 0 0 1 8.35 12.98a5.623 5.623 0 0 1 5.64-5.62c2.44 0 4.5 1.07 5.865 2.78l3.1-3.1C20.9 4.96 17.7 3.36 14 3.36c-5.87 0-10.64 4.77-10.64 10.64S8.13 24.64 14 24.64c5.78 0 10.64-4.8 10.64-10.64 0-.8-.1-1.6-.26-2.36l-12.14-.35z"
                    />
                  </svg>
                  <span className="text-xs font-bold">
                    Google
                  </span>
                </button>

                <button
                  onClick={() => handleTabChange(authMethod === "email" ? "mobile" : "email")}
                  type="button"
                  className="flex-1 h-[48px] border border-border-primary hover:border-text-primary hover:bg-bg-secondary active:scale-[0.99] flex items-center justify-center gap-2 rounded-[10px] transition-all duration-300 cursor-pointer text-text-primary bg-bg-primary"
                >
                  {authMethod === "email" ? (
                    <>
                      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold">
                        Mob. Num.
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold">
                        Email Login
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Form Footer Link */}
          <p className="text-[12px] text-text-secondary font-medium text-center w-full mt-8">
            Don't have account?{" "}
            <Link
              to="/signup"
              className="text-brand-purple hover:text-purple-600 font-bold ml-1 hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>

      {/* Google Mock Simulation Modal */}
      <Modal
        isOpen={showGoogleMockModal}
        onClose={() => setShowGoogleMockModal(false)}
        title="Google Authentication Simulator"
      >
        <div className="flex flex-col gap-5 text-left">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Since no Google Client ID is configured in <code className="text-slate-600 bg-slate-100 px-1 rounded font-mono">Frontend/eBookCreator/.env</code>, you can test the database onboarding, credentials registration, and OAuth profile syncing via this interactive emulator:
          </p>

          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Demo Google Account:
            </span>
            {[
              {
                name: "Sandeep Sharma",
                email: "sandeep@gmail.com",
                picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80",
              },
              {
                name: "Jane Doe",
                email: "jane.doe@gmail.com",
                picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80",
              },
              {
                name: "Alex Mercer",
                email: "alex.mercer@gmail.com",
                picture: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80",
              }
            ].map((account, idx) => (
              <button
                key={idx}
                onClick={() => handleMockGoogleLogin(account)}
                type="button"
                className="w-full flex items-center justify-between p-3.5 border border-slate-100 hover:border-slate-800 hover:bg-slate-50 rounded-xl transition-all duration-200 text-left group cursor-pointer bg-white"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={account.picture}
                    alt={account.name}
                    className="w-9 h-9 rounded-full border border-slate-100 shadow-sm"
                  />
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 group-hover:text-slate-900">
                      {account.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-500 font-medium">
                      {account.email}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                  Sign In
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-[1px] bg-slate-100"></div>
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-300">
              OR CUSTOM ACCOUNT
            </span>
            <div className="flex-1 h-[1px] bg-slate-100"></div>
          </div>

          <div className="flex flex-col gap-3">
            <InputField
              label="Custom Google Name"
              placeholder="e.g. John Watson"
              value={customMockGoogle.name}
              onChange={(e) => setCustomMockGoogle(prev => ({ ...prev, name: e.target.value }))}
            />
            <InputField
              label="Custom Google Email"
              type="email"
              placeholder="e.g. john.watson@gmail.com"
              value={customMockGoogle.email}
              onChange={(e) => setCustomMockGoogle(prev => ({ ...prev, email: e.target.value }))}
            />
            <Button
              onClick={() => {
                if (!customMockGoogle.name.trim() || !customMockGoogle.email.trim()) {
                  toast.error("Please fill custom Name and Email fields.");
                  return;
                }
                handleMockGoogleLogin({
                  name: customMockGoogle.name,
                  email: customMockGoogle.email,
                  picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
                });
              }}
              type="button"
              variant="primary"
              className="w-full h-[45px] bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold tracking-wider rounded-xl transition-all duration-300 border-none cursor-pointer"
            >
              Sign In with Custom Mock Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
