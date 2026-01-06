import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { pb } from "@/lib/pocketbase";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "Verifying your email..." : "Invalid verification link",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    async function verifyEmail() {
      try {
        await pb.collection("users").confirmVerification(token!);

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");

        toast.success("Email verified! You can now log in.");

        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Email verified! Please log in to continue.",
              email,
            },
          });
        }, 3000);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Verification failed. The link may be expired or invalid.");
        toast.error("Email verification failed");
      }
    }

    verifyEmail();
  }, [token, email, navigate]);

  const handleResend = async () => {
    const email = searchParams.get("email");
    if (!email) return;

    try {
      const response = await fetch("/api/v1/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to resend verification email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="text-6xl">📧</div>
            <h2 className="text-2xl font-bold">Verifying Email...</h2>
            <p className="text-muted-foreground">{message}</p>
            <div className="mx-auto h-2 w-32 animate-pulse rounded bg-primary/20"></div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold">Email Verified!</h2>
            <p className="text-muted-foreground">{message}</p>
            <div className="text-sm text-green-600">
              Redirecting to login page...
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold">Verification Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResend}
                className="btn btn-primary"
              >
                Resend Verification Email
              </button>
              <p className="text-sm text-muted-foreground">
                Or contact support if you continue to have issues.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
