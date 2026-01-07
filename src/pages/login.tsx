import { useAuthActions } from "@convex-dev/auth/react";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconFingerprint,
  IconServer,
  IconShieldLock,
  IconUserBolt,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app, auth } from "@/constants";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();

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

    setSubmitting(true);
    try {
      await signIn("password", {
        email: identity.trim().toLowerCase(),
        password: password.trim(),
        flow: "signIn",
      });
      // Redirect is handled by the auth state change usually, or we can force it?
      // Convex Auth usually handles session establishment.
      // We will rely on the root component to detect auth state change or we can navigate.
      // However, signIn with password might not throw if successful?
      // Actually, signIn returns a promise.
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Invalid credentials or error logging in");
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
          <Logo size={48} showTelemetry />
          <span className="text-muted-foreground text-sm font-semibold tracking-tight">
            {app.name}
          </span>
        </div>

        <div className="relative">
          <div className="text-primary/5 absolute -start-12 -top-24 text-[180px] leading-none font-bold select-none">
            {app.logo}
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
          <ErrorBoundary>
            <div className="mb-10 lg:hidden">
              <Logo size={64} className="mb-6" />
              <h2 className="text-4xl font-bold tracking-tight">
                {auth.login.title}
              </h2>
            </div>

            <div className="bg-card border-border relative rounded-2xl border p-8 shadow-xl lg:p-10">
              <div className="border-border mb-8 flex items-center justify-between border-b pb-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {auth.login.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs font-medium">
                    {auth.login.subtitle}
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
                    className="font-bold"
                    placeholder={auth.login.placeholders.email}
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
                    className="font-bold"
                    placeholder={auth.login.placeholders.password}
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
                  size="lg"
                  className="w-full"
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
          </ErrorBoundary>
        </PageTransition>
      </div>
    </div>
  );
}
