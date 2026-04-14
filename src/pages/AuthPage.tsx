import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else toast.success("Password reset link sent! Check your email.");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
      else toast.success("Welcome back!");
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Account created! Check your email to confirm.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-foreground">
        {/* Organic shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-background w-full">
          {/* Top */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf size={18} className="text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight">Tillies Avenue</span>
            </div>
          </div>

          {/* Center */}
          <div className="space-y-6 max-w-sm">
            <h2 className="font-heading text-4xl font-bold leading-tight tracking-tight">
              Your skin
              <br />
              deserves the
              <br />
              <span className="text-primary italic">best care.</span>
            </h2>
            <p className="font-accent text-sm leading-relaxed text-background/60">
              Discover curated skincare products handpicked for every skin type.
              Join thousands who trust Tillies Avenue for their glow-up journey.
            </p>
          </div>

          {/* Bottom — social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-foreground bg-primary/30"
                />
              ))}
            </div>
            <div>
              <p className="font-accent text-xs font-semibold text-background/80">2,000+ happy customers</p>
              <p className="font-accent text-[10px] text-background/40">and counting ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf size={14} className="text-primary" />
            </div>
            <span className="font-heading text-sm font-semibold tracking-tight">Tillies Avenue</span>
          </div>

          {/* Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  {mode === "forgot" ? (
                    <Mail size={16} className="text-primary" />
                  ) : mode === "signup" ? (
                    <Sparkles size={16} className="text-primary" />
                  ) : (
                    <Lock size={16} className="text-primary" />
                  )}
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                  {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
                </h1>
              </div>
              <p className="font-accent text-sm text-muted-foreground pl-[46px]">
                {mode === "login"
                  ? "Sign in to continue to your account"
                  : mode === "signup"
                  ? "Start your skincare journey today"
                  : "We'll send a reset link to your email"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="font-accent text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 font-accent text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="font-accent text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 font-accent text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode !== "forgot" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-accent text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="font-accent text-[11px] text-primary font-medium hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-11 font-accent text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {mode === "signup" && <PasswordStrengthIndicator password={password} />}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3 font-accent text-sm font-semibold text-background transition-all hover:bg-primary disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            {mode === "forgot" ? (
              <p className="font-accent text-sm text-muted-foreground">
                Remember your password?{" "}
                <button onClick={() => setMode("login")} className="font-semibold text-foreground hover:text-primary transition-colors">
                  Sign In
                </button>
              </p>
            ) : (
              <p className="font-accent text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            )}
          </div>

          {/* Divider + trust */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="font-accent text-[10px] text-center text-muted-foreground/50 uppercase tracking-widest">
              Secure & encrypted • SSL protected
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
