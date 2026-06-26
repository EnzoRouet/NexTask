import { useState } from "react";
import { Check, X, Eye, EyeOff } from "lucide-react";

export const PASSWORD_RULES = [
  { id: "length", label: "Au moins 12 caractères", regex: /.{12,}/ },
  { id: "uppercase", label: "Une majuscule", regex: /[A-Z]/ },
  { id: "lowercase", label: "Une minuscule", regex: /[a-z]/ },
  { id: "number", label: "Un chiffre", regex: /\d/ },
  { id: "special", label: "Un caractère spécial", regex: /[^a-zA-Z0-9]/ },
];

interface PasswordInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
}

export function PasswordInput({
  value,
  onChange,
}: Readonly<PasswordInputProps>) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isAllValid = PASSWORD_RULES.every((rule) =>
      rule.regex.test(newValue),
    );
    onChange(newValue, isAllValid);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          className="w-full h-11 px-3 pr-10 rounded-lg border border-white/10 text-sm outline-none transition-all bg-white/5 text-white placeholder:text-text-muted/50 focus:border-accent focus:bg-accent/5 focus:ring-1 focus:ring-accent/50 shadow-inner"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="bg-background border border-border-dim rounded-lg p-4 flex flex-col gap-3">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
          Critères de sécurité
        </p>
        <ul className="flex flex-col gap-2">
          {PASSWORD_RULES.map((rule) => {
            const isValid = rule.regex.test(value);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                  isValid ? "text-emerald-400 font-medium" : "text-text-muted"
                }`}
              >
                {isValid ? (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{rule.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
