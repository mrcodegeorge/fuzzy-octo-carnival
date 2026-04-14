import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // Supabase handles the session automatically
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/account"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf size={14} className="text-primary" />
          </div>
          <span className="font-heading text-sm font-semibold tracking-tight">Tillies Avenue</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              {success ? <CheckCircle size={16} className="text-primary" /> : <Lock size={16} className="text-primary" />}
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {success ? "All set!" : "New password"}
            </h1>
          </div>
          <p className="font-accent text-sm text-muted-foreground pl-[46px]">
            {success ? "Redirecting you to your account..." : "Choose a strong password for your account"}
          </p>
        </div>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="font-accent text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                New Password
              </label>
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
              <PasswordStrengthIndicator password={password} />
            </div>

            <div>
              <label className="font-accent text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 font-accent text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                  minLength={6}
                />
              </div>
            </div>

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
                  Update Password
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <p className="font-accent text-[10px] text-center text-muted-foreground/50 uppercase tracking-widest">
            Secure & encrypted • SSL protected
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
