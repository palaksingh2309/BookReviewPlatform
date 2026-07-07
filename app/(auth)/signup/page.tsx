import AuthShell from "../../../components/auth/AuthShell";
import SignupForm from "../../../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join thousands of readers on BookVerse."
      alternatePrompt="Already have an account?"
      alternateHref="/login"
      alternateLabel="Log in"
    >
      <SignupForm />
    </AuthShell>
  );
}
