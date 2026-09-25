import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useState } from "react";
import { EASE } from "@/lib/animations/animations";

const DEFAULT_CRITERIA = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

const DEFAULT_COLORS = {
  empty: "bg-gray-200 dark:bg-white/10",
  weak: "bg-red-500",
  fair: "bg-amber-400",
  good: "bg-sky-500",
  strong: "bg-emerald-500",
};

const DEFAULT_LABELS = {
  empty: "",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

function getPasswordStrength(value, criteria = DEFAULT_CRITERIA) {
  if (!value) return { level: "empty", score: 0, passed: 0, total: 5 };

  const checks = [
    value.length >= (criteria.minLength ?? 8),
    criteria.requireUppercase === false || /[A-Z]/.test(value),
    criteria.requireLowercase === false || /[a-z]/.test(value),
    criteria.requireNumbers === false || /\d/.test(value),
    criteria.requireSpecialChars === false || /[^A-Za-z0-9]/.test(value),
  ];
  const passed = checks.filter(Boolean).length;
  const levels = ["empty", "weak", "fair", "good", "strong", "strong"];

  return {
    level: levels[passed],
    score: passed * 2,
    passed,
    total: checks.length,
  };
}

export function PasswordStrengthIndicator({
  value = "",
  onChange,
  onStrengthChange,
  className = "",
  label = "Password",
  showScore = true,
  showScoreNumber = false,
  placeholder = "Enter your password",
  showVisibilityToggle = true,
  inputProps = {},
  strengthColors = DEFAULT_COLORS,
  strengthLabels = DEFAULT_LABELS,
  criteria = DEFAULT_CRITERIA,
  required = false,
  error,
}) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const strength = useMemo(
    () => getPasswordStrength(value, { ...DEFAULT_CRITERIA, ...criteria }),
    [criteria, value],
  );

  useEffect(() => {
    onStrengthChange?.(strength.level);
  }, [onStrengthChange, strength.level]);

  const activeColor = strengthColors[strength.level] ?? DEFAULT_COLORS[strength.level];
  const inactiveColor = strengthColors.empty ?? DEFAULT_COLORS.empty;
  const describedBy = error ? `${inputId}-error` : undefined;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-200">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        {showScoreNumber && (
          <span className="text-xs font-medium tabular-nums text-gray-400">{strength.score}/10</span>
        )}
      </div>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          {...inputProps}
          value={value}
          onChange={(event) => {
            inputProps.onChange?.(event);
            onChange?.(event.target.value);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-lg border bg-white pl-12 pr-12 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base dark:bg-[#1a1a28] dark:text-gray-100 ${error ? "border-red-500" : "border-gray-300 dark:border-white/15"} ${inputProps.className ?? ""}`}
        />
        {showVisibilityToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {value && (
          <motion.div
            key="password-strength"
            className="mt-2.5 flex items-center gap-3 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: EASE }}
          >
            <span className="sr-only" aria-live="polite">
              {`Password strength: ${strengthLabels[strength.level] ?? DEFAULT_LABELS[strength.level]}`}
            </span>
            <div className="grid flex-1 grid-cols-5 gap-1.5" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => {
                const active = index < strength.passed;

                return (
                  <span key={index} className={`relative h-1.5 overflow-hidden rounded-full ${inactiveColor}`}>
                    <motion.span
                      className={`absolute inset-0 origin-left rounded-full transition-colors duration-200 ${activeColor}`}
                      initial={false}
                      animate={{
                        opacity: active ? 1 : 0,
                        transform: reduceMotion || active ? "scaleX(1)" : "scaleX(0)",
                      }}
                      transition={{
                        duration: reduceMotion ? 0.15 : 0.22,
                        ease: EASE,
                      }}
                    />
                  </span>
                );
              })}
            </div>
            {showScore && (
              <span aria-hidden="true" className="relative grid min-w-12 overflow-hidden text-right text-xs font-semibold text-gray-500 dark:text-gray-300">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={strength.level}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(25%)" }}
                    animate={{ opacity: 1, transform: "none" }}
                    exit={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(-25%)" }}
                    transition={{ duration: reduceMotion ? 0.15 : 0.18, ease: EASE }}
                  >
                    {strengthLabels[strength.level] ?? DEFAULT_LABELS[strength.level]}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600 sm:text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
