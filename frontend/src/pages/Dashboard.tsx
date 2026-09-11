import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-ink-muted">
              {user?.fullName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Welcome back, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Ready to continue your exam preparation?
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="text-xs uppercase tracking-wide text-ink-muted">
              Practice sets
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink">0</div>
            <p className="text-sm text-ink-muted mt-1">Start a new practice session</p>
          </Card>
          <Card className="p-6">
            <div className="text-xs uppercase tracking-wide text-ink-muted">
              Mock exams
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink">0</div>
            <p className="text-sm text-ink-muted mt-1">Simulate real test conditions</p>
          </Card>
          <Card className="p-6">
            <div className="text-xs uppercase tracking-wide text-ink-muted">
              Study streak
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink">0 days</div>
            <p className="text-sm text-ink-muted mt-1">Keep the momentum going</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
