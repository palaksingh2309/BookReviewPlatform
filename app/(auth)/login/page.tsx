import AuthShell from "../../../components/auth/AuthShell";
import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your reading journey."
      alternatePrompt="Don't have an account?"
      alternateHref="/signup"
      alternateLabel="Sign up"
    >
      <LoginForm />
    </AuthShell>
  );
}
