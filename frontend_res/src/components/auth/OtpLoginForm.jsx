import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { z } from "zod";

import { requestOtp, verifyOtp } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

const otpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP code."),
});

function OtpLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const emailForm = useForm({
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const title = useMemo(
    () => (step === "email" ? "Sign in with OTP" : "Verify your code"),
    [step]
  );

  const handleRequestOtp = async (values) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const parsed = emailSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const response = await requestOtp(parsed.data.email);

      setEmail(parsed.data.email);
      setStep("otp");
      setSuccess(response?.data?.message || "OTP sent successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Unable to send OTP right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const parsed = otpSchema.safeParse(values);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(email, parsed.data.otp);

      const user = {
        id: response.data.user_id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };

      login(response.data.access_token, user, rememberMe);

      setSuccess("Login successful.");

      switch (user.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;

        case "waiter":
          navigate("/waiter", { replace: true });
          break;

        case "kitchen":
          navigate("/kitchen", { replace: true });
          break;

        default:
          navigate("/403", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail || "The OTP is invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">ServeSync</h1>

          <p className="mt-2 text-lg font-semibold text-text">{title}</p>
        </div>

        {step === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(handleRequestOtp)}
            className="space-y-4"
          >
            <div>
              <label
                className="mb-2 block text-sm font-medium text-text"
                htmlFor="email"
              >
                Staff email address
              </label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
                  size={18}
                />

                <Input
                  id="email"
                  type="email"
                  placeholder="name@restaurant.com"
                  className="pl-10"
                  {...emailForm.register("email")}
                />
              </div>

              {emailForm.formState.errors.email && (
                <p className="mt-2 text-sm text-error">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-secondary-text">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              Remember login
            </label>

            <Button type="submit" loading={loading} className="w-full">
              Send OTP
            </Button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-border bg-muted p-4 text-sm text-secondary-text">
              <div className="flex items-center gap-2 font-medium text-text">
                <ShieldCheck size={16} className="text-primary" />
                Verification code sent to {email}
              </div>

              <p className="mt-1">
                Enter the 6-digit code from your inbox to continue.
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-text"
                htmlFor="otp"
              >
                Verification code
              </label>

              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text"
                  size={18}
                />

                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  className="pl-10 tracking-[0.4em]"
                  {...otpForm.register("otp")}
                />
              </div>

              {otpForm.formState.errors.otp && (
                <p className="mt-2 text-sm text-error">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className="text-sm font-medium text-primary"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setSuccess("");
                  otpForm.reset();
                }}
              >
                Use a different email
              </button>

              <Button type="submit" loading={loading}>
                Verify & Sign In
              </Button>
            </div>
          </form>
        )}

        {(error || success) && (
          <p
            className={`mt-4 text-sm ${
              error ? "text-error" : "text-success"
            }`}
          >
            {error || success}
          </p>
        )}
      </Card>
    </motion.div>
  );
}

export default OtpLoginForm;