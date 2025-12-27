import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IconMail,
  IconShieldLock,
  IconUserBolt,
  IconFingerprint,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, app } from "@/constants";
import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import { digitsEnToFa } from "@persian-tools/persian-tools";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const deriveUsernameFromEmail = (email: string) => {
  const base = email.split("@")[0] ?? "";
  return base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .slice(0, 50);
};

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const resolvedUsername = useMemo(() => {
    if (username.trim()) return username.trim();
    return deriveUsernameFromEmail(email.trim());
  }, [email, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedEmail) newErrors.email = auth.errors.emailRequired;
    else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = auth.errors.emailInvalid;
    }

    if (!resolvedUsername) newErrors.username = auth.errors.usernameRequired;
    if (!trimmedPassword) newErrors.password = auth.errors.passwordRequired;
    if (!trimmedConfirm) {
      newErrors.confirmPassword = auth.errors.passwordConfirmRequired;
    } else if (trimmedPassword !== trimmedConfirm) {
      newErrors.confirmPassword = auth.errors.passwordsMismatch;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(auth.register.errors.credentialsRequired);
      return;
    }

    try {
      setSubmitting(true);
      await pb.collection("users").create({
        email: trimmedEmail,
        username: resolvedUsername,
        password: trimmedPassword,
        passwordConfirm: trimmedConfirm,
        role: "employee",
      });
      toast.success(auth.register.success);
      navigate("/login", { replace: true });
    } catch (error) {
      handlePocketBaseError(error as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen items-stretch overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="bg-muted/30 relative hidden flex-1 flex-col justify-between border-s p-12 lg:flex">
        <div className="text-primary flex items-center gap-3">
          <Logo size={40} showTelemetry />
          <span className="text-muted-foreground/70 text-sm font-bold tracking-tight">
            {app.name} / Secure Access
          </span>
        </div>

        <div className="relative">
          <div className="text-primary/5 absolute -start-12 -top-24 text-[180px] leading-none font-bold select-none">
            ANJAM
          </div>
          <h2 className="relative z-10 text-6xl leading-tight font-bold tracking-tighter lg:text-7xl xl:text-8xl">
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

      <div className="relative z-10 flex w-full flex-col justify-center px-6 lg:w-[500px] lg:px-12 xl:w-[600px] xl:px-20">
        <PageTransition className="w-full" disableStagger>
          <div className="mb-10 lg:hidden">
            <Logo size={48} className="mb-6" />
            <h2 className="text-4xl font-bold tracking-tight">
              {auth.register.title}
            </h2>
          </div>

          <div className="bg-card relative rounded-2xl border p-8 shadow-2xl lg:p-10">
            <div className="mb-8 flex items-center justify-between border-b pb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  {auth.register.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs font-medium">
                  {auth.register.initialAdminMessage}
                </p>
              </div>
              <IconShieldLock className="text-primary/20 size-8" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                    {auth.register.email}
                  </Label>
                  <IconMail className="text-muted-foreground/40 size-3" />
                </div>
                <Input
                  type="email"
                  value={email}
                  dir="ltr"
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border bg-muted/30 focus:border-primary/40 focus:bg-background focus:ring-primary/20 h-12 rounded-xl px-4 font-bold transition-all"
                  placeholder="name@company.com"
                  required
                  autoFocus
                  disabled={submitting}
                />
                {errors.email && (
                  <p className="text-destructive text-[10px] font-bold">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                    {auth.register.username}
                  </Label>
                  <IconUserBolt className="text-muted-foreground/40 size-3" />
                </div>
                <Input
                  type="text"
                  value={username}
                  dir="ltr"
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-border bg-muted/30 focus:border-primary/40 focus:bg-background focus:ring-primary/20 h-12 rounded-xl px-4 font-bold transition-all"
                  placeholder={resolvedUsername || "username"}
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
                  <Label className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                    {auth.register.password}
                  </Label>
                  <IconShieldLock className="text-muted-foreground/40 size-3" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-muted/30 focus:border-primary/40 focus:bg-background focus:ring-primary/20 h-12 rounded-xl px-4 font-bold transition-all"
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                    {auth.register.confirmPassword}
                  </Label>
                  <IconShieldLock className="text-muted-foreground/40 size-3" />
                </div>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border bg-muted/30 focus:border-primary/40 focus:bg-background focus:ring-primary/20 h-12 rounded-xl px-4 font-bold transition-all"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  disabled={submitting}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-[10px] font-bold">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="group h-14 w-full rounded-xl text-base font-bold shadow-sm transition-all active:scale-95"
                disabled={submitting}
              >
                <span className="flex items-center gap-2">
                  {submitting
                    ? auth.register.registering
                    : auth.register.registerButton}
                  {!submitting && (
                    <IconFingerprint className="size-5 transition-transform group-hover:rotate-12" />
                  )}
                </span>
              </Button>
            </form>
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground text-xs font-semibold">
                {auth.register.haveAccountPrompt}
              </span>
              <Button variant="ghost" asChild>
                <Link to="/login">{auth.register.loginButton}</Link>
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
