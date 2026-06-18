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
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-green-500 text-black pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Critères de sécurité
        </p>
        <ul className="flex flex-col gap-1.5">
          {PASSWORD_RULES.map((rule) => {
            const isValid = rule.regex.test(value);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                  isValid ? "text-green-600 font-medium" : "text-gray-500"
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
