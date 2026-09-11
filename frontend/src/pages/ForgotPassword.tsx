import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Logo } from "../components/Logo";
import { api, apiErrorMessage } from "../lib/api";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setError(null);
    try {
      await api.post("/auth/forgot-password", v);
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <main className="min-h-screen bg-bg-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Reset your password</h1>
        <p className="text-sm text-ink-muted mt-1">
          We&apos;ll email you a link to reset it.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <Alert variant="success">
              If that email is registered, a reset link is on its way.
            </Alert>
            <Link
              to="/login"
              className="block text-center text-sm font-medium text-primary hover:text-primary-hover"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            {error && <Alert variant="error">{error}</Alert>}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-ink-muted">
              <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </Card>
    </main>
  );
}
