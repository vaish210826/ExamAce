import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
  leftSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, rightSlot, leftSlot, id, className = "", type, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink mb-1.5">
            {label}
          </label>
        )}
        <div
          className={`flex items-center gap-2 w-full bg-white border rounded-xl px-3 py-2.5 transition-colors ${
            error ? "border-error" : "border-border focus-within:border-primary"
          }`}
        >
          {leftSlot}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`flex-1 bg-transparent text-ink placeholder:text-ink-muted/70 outline-none text-sm ${className}`}
            aria-invalid={!!error}
            {...rest}
          />
          {rightSlot}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-error">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export function PasswordInput(props: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-xs font-medium text-ink-muted hover:text-ink px-1"
          tabIndex={-1}
        >
          {show ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
