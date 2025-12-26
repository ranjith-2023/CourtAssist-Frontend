import React from "react";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = ({
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
  error = false,
}) => {
  // Simple mobile detection (can be replaced with a better hook if needed)
  const isMobile = window.innerWidth <= 768;

  const getInputClasses = () => {
    const baseClasses =
      "w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b1a2e] focus:border-transparent transition-all";
    const mobileClasses = isMobile
      ? "px-4 py-4 text-base"
      : "px-3 py-2 text-sm";
    return `${baseClasses} ${mobileClasses}`;
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${getInputClasses()} ${error ? "border-red-500" : ""}`}
        required
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};
