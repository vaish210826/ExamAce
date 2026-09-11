import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const schema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name").max(80),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Za-z]/, "Must contain a letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    accept: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    try {
      await registerUser(v.fullName, v.email, v.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(apiErrorMessage(err, "Unable to create account"));
    }
  };

  return (
    <main className="min-h-screen bg-bg-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6">
          <Logo />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
        <p className="text-sm text-ink-muted mt-1">
          Start preparing for your exams in minutes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            hint="Use 8+ characters with a letter and a number."
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <label className="flex items-start gap-2 text-sm text-ink-muted select-none">
            <input
              type="checkbox"
              className="mt-0.5 accent-[#4F46E5]"
              {...register("accept")}
            />
            <span>
              I agree to the{" "}
              <a className="text-primary hover:text-primary-hover font-medium" href="#">
                Terms
              </a>{" "}
              and{" "}
              <a className="text-primary hover:text-primary-hover font-medium" href="#">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.accept && <p className="text-xs text-error">{errors.accept.message}</p>}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
