import { useState } from "react";
import type { FormEvent } from "react";
import { ShieldCheck, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import closingEngageLogo from "../assets/closing-engage-logo.svg";

export function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <div className="mb-6">
            <h2 className="text-[24px] font-bold tracking-tight text-slate-900">Sign in to Admin</h2>
            <p className="mt-2 text-[14px] text-slate-500 leading-normal">
              Enter your authorized operational credentials to access your administrative workstation.
            </p>
          </div>

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
                <button type="button" className="text-[12px] font-semibold text-brand-500 hover:text-brand-600 focus:outline-none transition">
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
        </div>

        <div className="text-center text-[12px] text-slate-400 leading-relaxed px-4">
          This dashboard is private and strictly for authorized personnel. All sign-ins and operational activities are monitored
          and auditable.
        </div>
      </div>
    </div>
  );
}
