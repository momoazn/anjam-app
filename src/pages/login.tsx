import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  IconShieldLock,
  IconUserBolt,
  IconServer,
  IconFingerprint,
} from "@tabler/icons-react";

import { Logo } from "@/components/brand/logo";
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

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    identity?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { identity?: string; password?: string } = {};
    if (!identity.trim()) newErrors.identity = auth.errors.usernameRequired;
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
        .authWithPassword(identity.trim().toLowerCase(), password.trim());
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
    <div className="bg-background relative flex h-svh items-stretch overflow-hidden">
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
          <Logo size={40} showTelemetry />
          <span className="text-muted-foreground text-sm font-semibold tracking-tight">
            {app.name} / Secure Access
          </span>
        </div>

        <div className="relative">
          <div className="text-primary/5 absolute -start-12 -top-24 text-[180px] leading-none font-bold select-none">
            ANJAM
          </div>
          <h2 className="relative z-10 text-6xl leading-tight font-bold tracking-tight lg:text-7xl xl:text-8xl">
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
            <Logo size={48} className="mb-6" />
            <h2 className="text-4xl font-bold tracking-tight">
              {auth.login.title}
            </h2>
          </div>

          <div className="bg-card border-border relative rounded-[var(--ds-radius-card)] border p-8 shadow-xl lg:p-10">
            <div className="border-border mb-8 flex items-center justify-between border-b pb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
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
                  <Label className="text-muted-foreground text-xs font-bold tracking-tight">
                    {auth.login.username}
                  </Label>
                  <IconUserBolt className="text-muted-foreground/40 size-3.5" />
                </div>
                <Input
                  type="text"
                  value={identity}
                  dir="ltr"
                  onChange={(e) => setIdentity(e.target.value)}
                  className="h-[var(--ds-sizing-formControlHeight)] rounded-xl px-4 font-bold"
                  placeholder="name@company.com"
                  required
                  autoFocus
                  disabled={submitting}
                />
                {errors.identity && (
                  <p className="text-destructive text-[10px] font-bold">
                    {errors.identity}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground text-xs font-bold tracking-tight">
                    {auth.login.password}
                  </Label>
                  <IconServer className="text-muted-foreground/40 size-3.5" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[var(--ds-sizing-formControlHeight)] rounded-xl px-4 font-bold"
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
                className="h-14 w-full rounded-xl text-base font-bold shadow-sm"
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
            <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground text-xs font-semibold">
                {auth.login.noAccountPrompt}
              </span>
              <Button variant="ghost" asChild className="font-bold">
                <Link to="/register">{auth.login.registerButton}</Link>
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground/50 mt-8 text-center text-xs font-bold">
            {digitsEnToFa(`© 2025 ${auth.visual.copyright}`)}
          </p>
        </PageTransition>
      </div>
    </div>
  );
}
