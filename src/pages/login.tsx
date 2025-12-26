import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconFingerprint,
  IconShieldLock,
  IconUserBolt,
  IconServer,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, app } from "@/constants";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import type { UsersResponse } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

function isUsersRecord(record: object | null): record is UsersResponse {
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
    if (!username.trim()) newErrors.username = auth.errors.usernameRequired;
    if (!password.trim()) newErrors.password = auth.errors.passwordRequired;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(auth.login.errors.credentialsRequired);
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
    <div className="bg-background relative flex min-h-screen items-stretch overflow-hidden">
      {/* Background Decor */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Left Side: Visual Content (Desktop Only) */}
      <div className="bg-muted/30 relative hidden flex-1 flex-col justify-between border-s p-12 lg:flex">
        <div className="text-primary flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-none">
            <IconFingerprint className="size-6" />
          </div>
          <span className="text-sm font-black tracking-tight uppercase opacity-70">
            {app.name} / Secure Access
          </span>
        </div>

        <div className="relative">
          <div className="text-primary/5 absolute -start-12 -top-24 text-[180px] leading-none font-black uppercase select-none">
            ANJAM
          </div>
          <h2 className="relative z-10 text-6xl leading-tight font-black tracking-tighter lg:text-7xl xl:text-8xl">
            {digitsEnToFa(auth.visual.systemDevelopment)}
            <br />
            <span className="text-primary">
              {digitsEnToFa(auth.visual.management)}
            </span>
          </h2>
          <p className="text-muted-foreground/80 mt-8 max-w-md text-xl leading-relaxed font-medium">
            {digitsEnToFa(auth.visual.description)}
          </p>
        </div>

        <div className="opacity-0">{/* Bottom spacer */}</div>
      </div>

      {/* Right Side: Login Form */}
      <div className="relative z-10 flex w-full flex-col justify-center px-6 lg:w-[500px] lg:px-12 xl:w-[600px] xl:px-20">
        <PageTransition className="w-full" disableStagger>
          <div className="mb-10 lg:hidden">
            <div className="bg-primary text-primary-foreground shadow-primary/20 mb-6 flex size-12 items-center justify-center rounded-none shadow-md">
              <IconFingerprint className="size-7" />
            </div>
            <h2 className="text-4xl font-black tracking-tight">
              {auth.login.title}
            </h2>
          </div>

          <div className="bg-card relative rounded-none border p-8 shadow-2xl lg:p-10">
            <div className="mb-8 flex items-center justify-between border-b pb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  {auth.login.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs font-medium">
                  Please provide your credentials
                </p>
              </div>
              <IconShieldLock className="text-primary/20 size-8" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                    {auth.login.username}
                  </Label>
                  <IconUserBolt className="text-muted-foreground/40 size-3" />
                </div>
                <Input
                  type="text"
                  value={username}
                  dir="ltr"
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-border bg-muted/30 focus:border-primary/40 focus:bg-background focus:ring-primary/20 h-12 rounded-none px-4 font-bold transition-all"
                  placeholder="username"
                  required
                  autoFocus
                  disabled={submitting}
                />
                {errors.username && (
                  <p className="text-destructive text-[10px] font-bold">
                    {errors.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                    {auth.login.password}
                  </Label>
                  <IconServer className="text-muted-foreground/40 size-3" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-muted/30 focus:border-primary/40 focus:bg-background focus:ring-primary/20 h-12 rounded-none px-4 font-bold transition-all"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  disabled={submitting}
                />
                {errors.password && (
                  <p className="text-destructive text-[10px] font-bold">
                    {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="group h-14 w-full rounded-none text-base font-black shadow-sm transition-all active:scale-95"
                disabled={submitting}
              >
                <span className="flex items-center gap-2">
                  {submitting ? auth.login.loggingIn : auth.login.loginButton}
                  {!submitting && (
                    <IconFingerprint className="size-5 transition-transform group-hover:rotate-12" />
                  )}
                </span>
              </Button>
            </form>
          </div>

          <p className="text-muted-foreground/50 mt-8 text-center text-xs font-bold">
            {digitsEnToFa(`© 2025 ${auth.visual.copyright}`)}
          </p>
        </PageTransition>
      </div>
    </div>
  );
}
