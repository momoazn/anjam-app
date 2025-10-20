import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TEXT } from "@/constants/text";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { UsersRecord } from "@/lib/pocketbase-types";
import { useIsInitialAdmin } from "@/hooks";
import { useAuthStore } from "@/store/auth-store";

const createInitialAdmin = async (username: string, password: string) => {
  const response = await fetch("/api/tm/create-initial-admin", {
    method: "POST",
    body: JSON.stringify({
      username: username.trim().toLowerCase(),
      password: password.trim(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return false;
  }

  return true;
};

export default function Register() {
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { data: isInitialAdmin } = useIsInitialAdmin();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!username.trim())
      newErrors.username = TEXT.auth.errors.usernameRequired;
    if (!password.trim())
      newErrors.password = TEXT.auth.errors.passwordRequired;
    if (!confirmPassword.trim())
      newErrors.confirmPassword = TEXT.auth.errors.passwordConfirmRequired;
    if (
      !newErrors.password &&
      !newErrors.confirmPassword &&
      password !== confirmPassword
    )
      newErrors.confirmPassword = TEXT.auth.errors.passwordsMismatch;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(TEXT.auth.register.errors.credentialsRequired);
      return;
    }

    if (isInitialAdmin) {
      const isAdminCreated = await createInitialAdmin(username, password);
      if (!isAdminCreated) {
        toast.error(TEXT.auth.register.errors.adminCreationFailed);
        return;
      }

      await pb.collection("users").authWithPassword(username, password);
      login(pb.authStore.record as unknown as UsersRecord, pb.authStore.token);
      navigate("/", { replace: true });
      return;
    }

    try {
      setSubmitting(true);
      await pb.collection("users").create({
        username: username.trim().toLowerCase(),
        password: password.trim(),
        passwordConfirm: confirmPassword.trim(),
        role: "employee", // Default role for new registrations
      });

      await pb
        .collection("users")
        .authWithPassword(username.trim().toLowerCase(), password.trim());
      login(pb.authStore.record as unknown as UsersRecord, pb.authStore.token);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      handlePocketBaseError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="bg-card w-full max-w-md space-y-6 rounded-lg border p-8 shadow">
        <h2 className="text-foreground text-center text-3xl font-bold">
          {TEXT.auth.register.title}
        </h2>

        {isInitialAdmin && (
          <div className="flex flex-col items-center gap-4">
            <Separator />
            <p className="text-center">
              {TEXT.auth.register.initialAdminMessage}
            </p>
            <Separator />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {TEXT.auth.register.username}
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
                errors.username ? "register-username-error" : undefined
              }
              disabled={submitting}
            />
            {errors.username && (
              <p
                id="register-username-error"
                className="text-destructive mt-1 text-xs"
              >
                {errors.username}
              </p>
            )}
          </div>
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {TEXT.auth.register.password}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border px-3 py-2"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "register-password-error" : undefined
              }
              disabled={submitting}
            />
            {errors.password && (
              <p
                id="register-password-error"
                className="text-destructive mt-1 text-xs"
              >
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {TEXT.auth.register.confirmPassword}
            </Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
              disabled={submitting}
            />
            {errors.confirmPassword && (
              <p
                id="register-confirm-password-error"
                className="text-destructive mt-1 text-xs"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? TEXT.tasks.details.buttons.saving
              : TEXT.auth.register.registerButton}
          </Button>

          {!isInitialAdmin && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
              type="button"
              disabled={submitting}
            >
              {TEXT.auth.register.loginButton}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
