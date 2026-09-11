import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 select-none">
      <span
        className="grid place-items-center w-8 h-8 rounded-xl text-white font-bold text-sm"
        style={{ background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)" }}
      >
        EA
      </span>
      <span className="font-semibold text-ink tracking-tight">ExamAce</span>
    </Link>
  );
}
