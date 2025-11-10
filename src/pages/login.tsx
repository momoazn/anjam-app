import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fa } from "@/constants/text";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { UsersRecord } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";

// In production, PocketBase auth response record doesn't include sensitive fields
// like `password` or `tokenKey`. Use a minimal runtime check.
function isUsersRecord(record: object | null): record is UsersRecord {
  return (
    record !== null &&
    typeof record === "object" &&
    "id" in record &&
    "username" in record &&
    "role" in record
  );
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore().login;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = fa.auth.errors.usernameRequired;
    if (!password.trim()) newErrors.password = fa.auth.errors.passwordRequired;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(fa.auth.login.errors.credentialsRequired);
      return;
    }

    try {
      setSubmitting(true);
      await pb
        .collection("users")
        .authWithPassword(username.trim().toLowerCase(), password.trim());
      if (
        pb.authStore.record &&
        pb.authStore.token &&
        isUsersRecord(pb.authStore.record)
      ) {
        login(pb.authStore.record, pb.authStore.token);
        navigate("/", { replace: true });
      }
    } catch (error) {
      handlePocketBaseError(error as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <PageTransition
        className="bg-card w-full max-w-md space-y-6 rounded-lg border p-8 shadow"
        disableStagger
      >
        <h2 className="text-foreground text-center text-3xl font-bold">
          {fa.auth.login.title}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
          data-animate-stagger
        >
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {fa.auth.login.username}
            </Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border px-3 py-2"
              required
              autoFocus
              aria-invalid={Boolean(errors.username)}
              aria-describedby={
                errors.username ? "login-username-error" : undefined
              }
              disabled={submitting}
            />
            {errors.username && (
              <p
                id="login-username-error"
                className="text-destructive mt-1 text-xs"
              >
                {errors.username}
              </p>
            )}
          </div>
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {fa.auth.login.password}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border px-3 py-2"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              disabled={submitting}
            />
            {errors.password && (
              <p
                id="login-password-error"
                className="text-destructive mt-1 text-xs"
              >
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? fa.tasks.details.buttons.saving
              : fa.auth.login.loginButton}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/register")}
            type="button"
            disabled={submitting}
          >
            {fa.auth.login.registerButton}
          </Button>
        </form>
      </PageTransition>
    </div>
  );
}
