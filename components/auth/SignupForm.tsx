"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signupSchema, SignupSchema } from "../../lib/validators";
import { signUp } from "../../services/auth";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupSchema) {
    try {
      const { error } = await signUp(data.email, data.password);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Account created! Please check your email.");

      reset();
    } catch (error) {
      alert("Something went wrong.");
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <div>
        <label>Email</label>
        <input
          type="email"
          {...register("email")}
        />
        <p>{errors.email?.message}</p>
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          {...register("password")}
        />
        <p>{errors.password?.message}</p>
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
        />
        <p>{errors.confirmPassword?.message}</p>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

    </form>
  );
}