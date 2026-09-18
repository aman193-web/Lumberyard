import React from "react";
import { Check } from "lucide-react";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Required when the checkbox has no visible label. */
  ariaLabel?: string;
  className?: string;
};

/**
 * A checkbox that looks the same in every browser. The native control is kept
 * for keyboard and screen-reader behaviour but its own painting is turned off,
 * so the box is ours: slate outline when empty, amber with a white tick when
 * checked.
 */
export function Checkbox({ checked, onChange, disabled, ariaLabel, className = "" }: Props) {
  return (
    <span className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={e => onChange(e.target.checked)}
        className="peer appearance-none w-[18px] h-[18px] rounded-[6px] border border-slate-300 bg-white cursor-pointer transition-colors hover:border-slate-400 checked:bg-amber-500 checked:border-amber-500 checked:hover:bg-amber-600 checked:hover:border-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
      />
      <Check
        size={12}
        strokeWidth={3.5}
        className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity"
      />
    </span>
  );
}

/** Checkbox with a clickable text label beside it. */
export function CheckboxField({
  checked, onChange, disabled, label, description, className = "",
}: Omit<Props, "ariaLabel"> & { label: React.ReactNode; description?: React.ReactNode }) {
  return (
    <label className={`flex items-start gap-2.5 cursor-pointer select-none ${disabled ? "cursor-not-allowed" : ""} ${className}`}>
      <Checkbox checked={checked} onChange={onChange} disabled={disabled} className="mt-0.5" />
      <span className="min-w-0">
        <span className="block text-xs text-slate-700 font-medium leading-snug">{label}</span>
        {description && <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">{description}</span>}
      </span>
    </label>
  );
}
