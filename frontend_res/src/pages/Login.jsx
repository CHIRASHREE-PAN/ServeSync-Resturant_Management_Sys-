import OtpLoginForm from "../components/auth/OtpLoginForm";

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <OtpLoginForm />
    </div>
  );
}

export default LoginPage;