import { ReactNode } from "react";

type Variant = "success" | "error" | "warning" | "info";

const styles: Record<Variant, string> = {
  success: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
  error: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  warning: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
  info: "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]",
};

export function Alert({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`text-sm rounded-xl border px-3.5 py-2.5 ${styles[variant]}`}
    >
      {children}
    </div>
  );
}
