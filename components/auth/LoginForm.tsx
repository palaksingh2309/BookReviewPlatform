"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginSchema } from "../../lib/validators";
import { login } from "../../services/auth";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginSchema) {
    try {
        
      const { error } = await login(data.email, data.password);
      console.log("Login Error:", error);

const {
  data: { session },
} = await supabase.auth.getSession();

console.log("Session:", session);
      if (error) {
        alert(error.message);
        return;
      }

      // Success message
     

      // Redirect to dashboard
     console.log("Before redirect");

     router.replace("/dashboard");

     console.log("After redirect");

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <br />
        <input type="email" {...register("email")} />
        <br />
        <p>{errors.email?.message}</p>
      </div>

      <div>
        <label>Password</label>
        <br />
        <input type="password" {...register("password")} />
        <br />
        <p>{errors.password?.message}</p>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}