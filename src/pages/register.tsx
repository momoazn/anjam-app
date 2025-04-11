import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pb } from "@/lib/pocketbase";
import { UsersRoleOptions } from "@/lib/pocketbase-types";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !passwordConfirm.trim()) {
      console.error("Username and password are required");
      alert("Username and password are required");
      return;
    }

    if (password !== passwordConfirm) {
      console.error("Passwords do not match");
      alert("Passwords do not match");
      return;
    }

    try {
      await pb.collection("users").create({
        username,
        password,
        passwordConfirm,
        role: UsersRoleOptions.employee,
      });
      await pb.collection("users").authWithPassword(username, password);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium">Username</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <Label className="block text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Register
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
