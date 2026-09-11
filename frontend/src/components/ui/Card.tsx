import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card border border-border rounded-2xl shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
