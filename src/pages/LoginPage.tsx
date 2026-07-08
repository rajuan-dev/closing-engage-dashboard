import { useState } from "react";
import type { FormEvent } from "react";
import { ShieldCheck, Mail, LockKeyhole, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import closingEngageLogo from "../assets/closing-engage-logo.svg";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<void>;
  onVerifyPasswordResetOtp: (email: string, otp: string) => Promise<void>;
  onResetPasswordWithOtp: (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
}

export function LoginPage({
  onLogin,
  onRequestPasswordReset,
  onVerifyPasswordResetOtp,
  onResetPasswordWithOtp,
}: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "forgot-password" | "verify-otp" | "reset-password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset state
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your admin credentials.");
      return;
    }

    setIsSubmitting(true);

    try {
      setError("");
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setResetEmail(email);
    setError("");
    setSuccessMessage("");
    setMode("forgot-password");
  };

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onRequestPasswordReset(resetEmail.trim());
      setOtp("");
      setSuccessMessage("If an account exists for this email, a verification code has been sent.");
      setMode("verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onVerifyPasswordResetOtp(resetEmail.trim(), otp);
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage("Verification code confirmed. You can now choose a new password.");
      setMode("reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onResetPasswordWithOtp(resetEmail.trim(), otp, newPassword, confirmNewPassword);
      setSuccessMessage("Password reset successfully. You can now log in.");
      setEmail(resetEmail); // pre-populate sign-in email
      setPassword(""); // clear password field
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="flex flex-col items-center">
          <img src={closingEngageLogo} alt="Closing Engage" className="h-10 w-auto object-contain" />
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
            <ShieldCheck size={12} className="text-brand-500" />
            Operations Admin Portal
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          {mode === "login" && (
            <>
              <div className="mb-6">
                <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Sign in to Admin</h2>
                <p className="mt-2 text-[14px] text-slate-500 leading-normal">
                  Enter your authorized operational credentials to access your administrative workstation.
                </p>
              </div>

              {successMessage && (
                <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[13px] text-emerald-600 font-medium">
                  {successMessage}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Work Email Address
                  </label>
                  <div className="relative flex h-12 items-center rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
                    <Mail size={16} className="text-slate-400 mr-2.5" />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="admin@email.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPasswordClick}
                      className="text-[12px] font-semibold text-brand-500 hover:text-brand-600 focus:outline-none transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex h-12 items-center rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
                    <LockKeyhole size={16} className="text-slate-400 mr-2.5" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 pr-10"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((curr) => !curr)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 block text-[13px] text-slate-500 select-none cursor-pointer">
                    Keep this workstation signed in
                  </label>
                </div>

                {!rememberMe && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-[13px] text-amber-700">
                    Session persistence is currently token-based. Unchecking this does not change storage behavior yet.
                  </div>
                )}

                {error && <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[13px] text-rose-600 font-medium">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[14px] font-bold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying Credentials...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Access Admin Dashboard
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {mode === "forgot-password" && (
            <>
              <div className="mb-6">
                <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Reset password</h2>
                <p className="mt-2 text-[14px] text-slate-500 leading-normal">
                  Enter your email address and we'll send you a 6-digit OTP to reset your password.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Work Email Address
                  </label>
                  <div className="relative flex h-12 items-center rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
                    <Mail size={16} className="text-slate-400 mr-2.5" />
                    <input
                      value={resetEmail}
                      onChange={(event) => setResetEmail(event.target.value)}
                      className="w-full border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="admin@email.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                {error && <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[13px] text-rose-600 font-medium">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[14px] font-bold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending OTP...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Send Reset OTP
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="flex items-center justify-center gap-2 w-full text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </button>
              </form>
            </>
          )}

          {mode === "verify-otp" && (
            <>
              <div className="mb-6">
                <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Verify OTP</h2>
                <p className="mt-2 text-[14px] text-slate-500 leading-normal">
                  We've sent a 6-digit verification code to <span className="font-semibold text-slate-800">{resetEmail}</span>.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Verification Code
                  </label>
                  <div className="relative flex h-12 items-center rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
                    <KeyRound size={16} className="text-slate-400 mr-2.5" />
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 tracking-[0.2em] font-semibold"
                      placeholder="000000"
                      type="text"
                      required
                    />
                  </div>
                </div>

                {error && <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[13px] text-rose-600 font-medium">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[14px] font-bold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying OTP...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify OTP
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setError("");
                    setOtp("");
                  }}
                  className="flex items-center justify-center gap-2 w-full text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition"
                >
                  <ArrowLeft size={14} />
                  Back to email entry
                </button>
              </form>
            </>
          )}

          {mode === "reset-password" && (
            <>
              <div className="mb-6">
                <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Choose new password</h2>
                <p className="mt-2 text-[14px] text-slate-500 leading-normal">
                  Set a new secure password for your administrative workstation.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">New Password</label>
                  <div className="relative flex h-12 items-center rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
                    <LockKeyhole size={16} className="text-slate-400 mr-2.5" />
                    <input
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 pr-10"
                      placeholder="••••••••"
                      type={showNewPassword ? "text" : "password"}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((curr) => !curr)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">Confirm New Password</label>
                  <div className="relative flex h-12 items-center rounded-xl border border-slate-200 bg-[#fbfcfd] px-3 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
                    <LockKeyhole size={16} className="text-slate-400 mr-2.5" />
                    <input
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                      className="w-full border-0 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 pr-10"
                      placeholder="••••••••"
                      type={showNewPassword ? "text" : "password"}
                      required
                    />
                  </div>
                </div>

                {error && <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[13px] text-rose-600 font-medium">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[14px] font-bold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating Password...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center text-[12px] text-slate-400 leading-relaxed px-4">
          This dashboard is private and strictly for authorized personnel. All sign-ins and operational activities are monitored
          and auditable.
        </div>
      </div>
    </div>
  );
}
