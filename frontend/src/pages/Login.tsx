import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "../components/ui/Card";
import { Input, PasswordInput } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/api";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await login(values.email, values.password);
      setSuccess(true);
      const dest = location.state?.from ?? "/dashboard";
      setTimeout(() => navigate(dest, { replace: true }), 400);
    } catch (err) {
      setServerError(apiErrorMessage(err, "Unable to sign in"));
    }
  };

  return (
    <main className="min-h-screen bg-bg-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Logo />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="text-sm text-ink-muted mt-1">
          Sign in to continue your exam preparation
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}
          {success && <Alert variant="success">Signed in. Redirecting…</Alert>}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
            Create Account
          </Link>
        </p>
      </Card>
    </main>
  );
}
