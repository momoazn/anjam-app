import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEXT } from "@/constants/text";
import { pb } from "@/lib/pocketbase";
import { UsersRecord } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore().login;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      console.error(TEXT.auth.login.errors.credentialsRequired);
      alert(TEXT.auth.login.errors.credentialsRequired);
      return;
    }

    try {
      await pb.collection("users").authWithPassword(username, password);
      login(pb.authStore.record as unknown as UsersRecord, pb.authStore.token);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert(TEXT.auth.login.errors.invalidCredentials);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {TEXT.auth.login.title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700">
              {TEXT.auth.login.username}
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
            <Label className="block text-sm font-medium text-gray-700">
              {TEXT.auth.login.password}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {TEXT.auth.login.loginButton}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/register")}
          >
            {TEXT.auth.login.registerButton}
          </Button>
        </form>
      </div>
    </div>
  );
}
