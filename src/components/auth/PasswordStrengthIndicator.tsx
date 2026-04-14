import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const requirements = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const results = useMemo(
    () => requirements.map((r) => ({ ...r, met: r.test(password) })),
    [password]
  );

  const metCount = results.filter((r) => r.met).length;
  const strength = metCount <= 1 ? "Weak" : metCount <= 3 ? "Fair" : metCount <= 4 ? "Good" : "Strong";
  const strengthColor =
    metCount <= 1
      ? "bg-destructive"
      : metCount <= 3
      ? "bg-accent"
      : metCount <= 4
      ? "bg-primary"
      : "bg-green-500";

  if (!password) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-3 pt-1"
      >
        {/* Strength bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-accent text-[11px] tracking-wide text-muted-foreground uppercase">
              Password strength
            </span>
            <span className="font-accent text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {strength}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < metCount ? strengthColor : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Requirements checklist */}
        <div className="grid grid-cols-1 gap-1">
          {results.map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              {r.met ? (
                <Check size={12} className="text-green-500 shrink-0" />
              ) : (
                <X size={12} className="text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={`font-accent text-[11px] transition-colors ${
                  r.met ? "text-foreground" : "text-muted-foreground/60"
                }`}
              >
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PasswordStrengthIndicator;
