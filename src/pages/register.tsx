import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { UsersRecord } from "@/lib/pocketbase-types";
import { useIsInitialAdmin } from "@/pb-hooks";
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

  const { data: isInitialAdmin } = useIsInitialAdmin();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      console.error(TEXT.auth.register.errors.credentialsRequired);
      toast.error(TEXT.auth.register.errors.credentialsRequired);
      return;
    }

    if (password !== confirmPassword) {
      console.error(TEXT.auth.register.errors.passwordsMismatch);
      toast.error(TEXT.auth.register.errors.passwordsMismatch);
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
    } catch (error) {
      console.error(error);
      toast.error(TEXT.auth.login.errors.invalidCredentials);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {TEXT.auth.register.username}
            </Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <Label className="text-foreground block text-sm font-medium">
              {TEXT.auth.register.password}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
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
            />
          </div>

          <Button type="submit" className="w-full">
            {TEXT.auth.register.registerButton}
          </Button>

          {!isInitialAdmin && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              {TEXT.auth.register.loginButton}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
