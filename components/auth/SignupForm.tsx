"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

import { signupSchema, SignupSchema } from "../../lib/validators";
import { signUp } from "../../services/auth";

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupSchema) {
    setFormError(null);

    try {
      const { data: authData, error } = await signUp(data.email, data.password);

      if (error) {
        setFormError(error.message);
        return;
      }

      if (!authData.session) {
        setFormError(
          "Account created but no session was returned. Disable email confirmation in your Supabase project settings to sign in immediately."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {formError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-neutral-200">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-300">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-200"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-white"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-300">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-neutral-200"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-neutral-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-white"
            onClick={() => setShowConfirmPassword((visible) => !visible)}
            aria-label={
              showConfirmPassword ? "Hide confirm password" : "Show confirm password"
            }
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-300">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
