import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, Lock, Mail, CheckCircle2 } from "lucide-react";

const AuthPage = () => {
  const [view, setView] = useState("login"); // 'login' | 'signup' | 'otp'

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white font-sans text-[#111827]">
      {/* LEFT SECTION: Forms */}
      <div className="relative flex w-full flex-col justify-center px-[40px] py-[40px] md:w-1/2 lg:px-[100px]">
        {/* Back to Home */}
        <Link
          to="/"
          className="absolute left-[40px] top-[40px] flex items-center gap-2 text-[14px] font-semibold text-[#667085] transition-colors hover:text-[#111827] lg:left-[100px]"
        >
          <ChevronLeft size={18} />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="mb-[60px] flex items-center relative overflow-visible w-[140px] h-[50px]">
          <img src="/logo.png" alt="DesignDroid AI Logo" className="absolute left-[-20px] top-[-42px] w-[310px] max-w-none mix-blend-multiply pointer-events-none" />
        </div>

        <div className="relative min-h-[400px] w-full max-w-[420px]">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <LoginForm key="login" onSwitch={() => setView("signup")} />
            )}
            {view === "signup" && (
              <SignUpForm key="signup" onSwitch={() => setView("login")} onNext={() => setView("otp")} />
            )}
            {view === "otp" && (
              <OTPForm key="otp" onBack={() => setView("signup")} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SECTION: Visual Decoration */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#fafafa] md:flex">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[#f0ebff] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#e9fbf4] blur-[100px]" />

        {/* Decorative Graphic */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex h-[480px] w-[420px] flex-col items-center justify-center rounded-[40px] border border-white/50 bg-white/40 p-[40px] shadow-[0_40px_100px_rgba(16,24,40,.08)] backdrop-blur-2xl"
        >
          <div className="relative mb-[40px] flex h-[120px] w-[120px] items-center justify-center rounded-full bg-white shadow-xl">
            <div className="absolute h-[160px] w-[160px] animate-[spin_10s_linear_infinite] rounded-full border border-dashed border-[#d1d5db]" />
            <img src="/auth-icon.png" alt="Feature Icon" className="w-[60px] h-[60px] object-contain" />
          </div>
          <h3 className="text-center text-[28px] font-black leading-[1.2] tracking-tight text-[#111827]">
            Welcome to the future of UI design.
          </h3>
          <p className="mt-[16px] text-center text-[15px] font-medium leading-[1.6] text-[#667085]">
            Generate, edit, and export production-ready React components from a single prompt.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/* ==============================================================
   LOGIN FORM
============================================================== */
const LoginForm = ({ onSwitch }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
    >
      <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#111827]">
        Welcome back
      </h1>
      <p className="mt-2 text-[15px] text-[#667085]">
        Enter your details to access your workspace.
      </p>

      <form className="mt-[40px] flex flex-col gap-[20px]" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <Mail className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#98a2b3]" size={20} />
          <input
            type="email"
            placeholder="Email address"
            className="h-[60px] w-full rounded-[16px] bg-[#f8fafc] pl-[56px] pr-[20px] text-[15px] font-medium text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#5148e9]/20"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#98a2b3]" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="h-[60px] w-full rounded-[16px] bg-[#f8fafc] pl-[56px] pr-[20px] text-[15px] font-medium text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#5148e9]/20"
          />
        </div>

        <div className="flex items-center justify-between text-[14px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-[18px] w-[18px] rounded-[6px] border-[#d1d5db] text-[#5148e9] focus:ring-[#5148e9]" />
            <span className="font-medium text-[#475467]">Remember me</span>
          </label>
          <a href="#" className="font-bold text-[#5148e9] hover:underline">Forgot password?</a>
        </div>

        <button className="group relative mt-[10px] flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#111827] text-[16px] font-bold text-white transition-all hover:bg-black hover:shadow-[0_15px_30px_rgba(17,24,39,.25)] active:scale-[0.98]">
          Log In
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="mt-[32px] text-center text-[15px] font-medium text-[#667085]">
        Don't have an account?{" "}
        <button onClick={onSwitch} className="font-bold text-[#5148e9] hover:underline">
          Sign up
        </button>
      </p>
    </motion.div>
  );
};

/* ==============================================================
   SIGN UP FORM
============================================================== */
const SignUpForm = ({ onSwitch, onNext }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(); // Proceed to OTP
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
    >
      <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#111827]">
        Create account
      </h1>
      <p className="mt-2 text-[15px] text-[#667085]">
        Start designing beautiful interfaces in seconds.
      </p>

      <form className="mt-[40px] flex flex-col gap-[20px]" onSubmit={handleSubmit}>
        <div className="flex gap-[16px]">
          <input
            type="text"
            placeholder="First name"
            required
            className="h-[60px] w-1/2 rounded-[16px] bg-[#f8fafc] px-[20px] text-[15px] font-medium text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#5148e9]/20"
          />
          <input
            type="text"
            placeholder="Last name"
            required
            className="h-[60px] w-1/2 rounded-[16px] bg-[#f8fafc] px-[20px] text-[15px] font-medium text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#5148e9]/20"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#98a2b3]" size={20} />
          <input
            type="email"
            placeholder="Email address"
            required
            className="h-[60px] w-full rounded-[16px] bg-[#f8fafc] pl-[56px] pr-[20px] text-[15px] font-medium text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#5148e9]/20"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#98a2b3]" size={20} />
          <input
            type="password"
            placeholder="Create a password"
            required
            className="h-[60px] w-full rounded-[16px] bg-[#f8fafc] pl-[56px] pr-[20px] text-[15px] font-medium text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#5148e9]/20"
          />
        </div>

        <button type="submit" className="group relative mt-[10px] flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#5148e9] text-[16px] font-bold text-white shadow-[0_15px_30px_rgba(81,72,233,.25)] transition-all hover:bg-[#4338ca] active:scale-[0.98]">
          Continue
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <p className="mt-[32px] text-center text-[15px] font-medium text-[#667085]">
        Already have an account?{" "}
        <button onClick={onSwitch} className="font-bold text-[#5148e9] hover:underline">
          Log in
        </button>
      </p>
    </motion.div>
  );
};

/* ==============================================================
   OTP VERIFICATION FORM
============================================================== */
const OTPForm = ({ onBack }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (/[^0-9]/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setIsSuccess(true);
        // After 2s redirect or show success
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-[24px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#e9fbf4] text-[#20c997]">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-[32px] font-black tracking-tight text-[#111827]">
          Verified!
        </h1>
        <p className="mt-2 text-[16px] text-[#667085]">
          Your account is ready. Redirecting...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col"
    >
      <button onClick={onBack} className="mb-[30px] flex items-center gap-1 self-start text-[14px] font-bold text-[#667085] hover:text-[#111827]">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="text-[40px] font-black tracking-[-1.5px] text-[#111827]">
        Verify email
      </h1>
      <p className="mt-2 text-[15px] text-[#667085]">
        We sent a 6-digit code to your email.
        <br />
        Enter it below to confirm your account.
      </p>

      <form className="mt-[40px] flex flex-col gap-[20px]" onSubmit={handleVerify}>
        <div className="flex justify-between gap-[10px]">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="h-[65px] w-[55px] rounded-[16px] border-2 border-transparent bg-[#f8fafc] text-center text-[24px] font-black text-[#111827] outline-none transition-all focus:border-[#5148e9] focus:bg-white focus:shadow-[0_0_0_4px_rgba(81,72,233,0.1)]"
            />
          ))}
        </div>

        <button 
          type="submit" 
          disabled={isVerifying || otp.join("").length < 6}
          className="mt-[20px] flex h-[60px] w-full items-center justify-center rounded-[16px] bg-[#111827] text-[16px] font-bold text-white transition-all hover:bg-black disabled:opacity-50 disabled:hover:bg-[#111827]"
        >
          {isVerifying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-[24px] w-[24px] rounded-full border-[3px] border-white border-t-transparent"
            />
          ) : (
            "Verify Account"
          )}
        </button>
      </form>

      <p className="mt-[32px] text-center text-[15px] font-medium text-[#667085]">
        Didn't receive code?{" "}
        <button className="font-bold text-[#5148e9] hover:underline">
          Resend
        </button>
      </p>
    </motion.div>
  );
};

export default AuthPage;
