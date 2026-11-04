import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconEye,
  IconEyeOff,
  IconFingerprint,
  IconMail,
  IconShieldLock,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app, auth } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { handleError } from "@/lib/error-handler";
import { displayNameFromEmail } from "@/lib/utils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) newErrors.email = auth.errors.emailRequired;
    else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = auth.errors.emailInvalid;
    }

    if (!password) newErrors.password = auth.errors.passwordRequired;
    if (!confirmPassword) {
      newErrors.confirmPassword = auth.errors.passwordConfirmRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = auth.errors.passwordsMismatch;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(auth.register.errors.credentialsRequired);
      return;
    }

    setSubmitting(true);
    try {
      // Generate display name from email for better UX
      const name = displayNameFromEmail(trimmedEmail);

      const result = await authClient.signUp.email({
        name,
        email: trimmedEmail,
        password,
      });
      if (result.error) {
        throw new Error(result.error.message || auth.errors.serverError);
      }

      toast.success(auth.register.success);
      navigate("/onboarding", { replace: true });
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background relative flex h-svh items-stretch overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="bg-muted/30 relative hidden flex-1 flex-col justify-between border-s p-12 lg:flex">
        <div className="text-primary flex items-center gap-3">
          <Logo size={48} showTelemetry />
          <span className="text-muted-foreground/70 text-sm font-bold tracking-tight">
            {app.name}
          </span>
        </div>

        <div className="relative">
          <div className="text-primary/5 absolute -start-12 -top-24 text-[180px] leading-none font-bold select-none">
            {app.logo}
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

      <div className="relative z-10 flex w-full flex-col justify-center px-6 lg:w-125 lg:px-12 xl:w-150 xl:px-20">
        <PageTransition className="w-full" disableStagger>
          <div className="mb-8 lg:hidden">
            <Logo size={48} showText />
          </div>

          <Card className="relative p-0 shadow-2xl">
            <CardContent className="p-8 lg:p-10">
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
                    className="font-bold"
                    placeholder={auth.login.placeholders.email}
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
                      {auth.register.password}
                    </Label>
                    <IconShieldLock className="text-muted-foreground/40 size-3" />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="font-bold pr-9"
                      placeholder={auth.login.placeholders.password}
                      required
                      dir="ltr"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground/ hover:text-muted-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors disabled:opacity-50"
                      disabled={submitting}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <IconEyeOff className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </button>
                  </div>
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
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="font-bold pr-9"
                      placeholder={auth.login.placeholders.password}
                      required
                      dir="ltr"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-muted-foreground/ hover:text-muted-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors disabled:opacity-50"
                      disabled={submitting}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <IconEyeOff className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-[10px] font-bold">
                      {errors.confirmPassword}
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
            </CardContent>
          </Card>

          <p className="text-muted-foreground/50 mt-8 text-center text-xs font-bold">
            {digitsEnToFa(
              `© ${new Date().getFullYear()} ${auth.visual.copyright}`,
            )}
          </p>
        </PageTransition>
      </div>
    </div>
  );
}
