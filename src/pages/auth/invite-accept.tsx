import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconAlertCircle,
  IconFingerprint,
  IconLoader2,
  IconMail,
  IconShieldLock,
} from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app, auth } from "@/constants";
import { useInviteByToken } from "@/hooks/invites";
import { useAcceptOrgInvitation } from "@/hooks/organization-members";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/convex";
import { loginPathFor } from "@/lib/return-to";
import {
  useAuthIsAuthenticated,
  useAuthStore,
  useUserOrganizations,
} from "@/store/app-context-store";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteAccept() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const isLoggedIn = useAuthIsAuthenticated();
  const { data: session } = authClient.useSession();

  const { data: inviteData, isLoading, error } = useInviteByToken(token ?? "");
  const acceptInviteMutation = useAcceptOrgInvitation();
  const ensureProfile = useMutation(api.users.ensureProfile);

  const switchOrganization = useAuthStore((s) => s.switchOrganization);
  const userOrganizations = useUserOrganizations();
  const [joinedOrgId, setJoinedOrgId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Switch once the org list (reactive) includes the joined org.
  useEffect(() => {
    if (!joinedOrgId) return;
    if (!userOrganizations.some((o) => o.organization._id === joinedOrgId)) {
      return;
    }
    void switchOrganization(joinedOrgId);
    navigate("/inbox", { replace: true });
  }, [joinedOrgId, userOrganizations, switchOrganization, navigate]);

  const acceptAsCurrentUser = async () => {
    try {
      await ensureProfile({});
      const result = await acceptInviteMutation.mutate(token ?? "");
      toast.success(auth.invite.success);
      setJoinedOrgId(result.organizationId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : auth.errors.serverError);
    }
  };

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

    try {
      // Create an account (or log in) first, then accept the invite as the authenticated user.
      // Invite acceptance is implemented as `acceptExistingUser` in Convex.
      try {
        const result = await authClient.signUp.email({
          name: trimmedEmail.split("@")[0] || "User",
          email: trimmedEmail,
          password,
        });
        if (result.error) {
          throw new Error(result.error.message || auth.errors.serverError);
        }
      } catch {
        const result = await authClient.signIn.email({
          email: trimmedEmail,
          password,
        });
        if (result.error) {
          throw new Error(result.error.message || auth.errors.serverError);
        }
      }

      await ensureProfile({});
      const result = await acceptInviteMutation.mutate(token ?? "");
      toast.success(auth.invite.success);
      setJoinedOrgId(result.organizationId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : auth.errors.serverError);
    }
  };

  const submitting = acceptInviteMutation.isPending;
  const canAcceptAsCurrentUser = isLoggedIn;

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <IconLoader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !inviteData || inviteData.status !== "valid") {
    // Match error messages (supports both Persian backend messages and English fallbacks)
    const status = inviteData?.status;
    const errorMessage =
      status === "expired"
        ? auth.invite.errors.inviteExpired
        : status === "exhausted"
          ? auth.invite.errors.inviteExhausted
          : auth.invite.errors.inviteNotFound;

    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="rounded-none p-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <IconAlertCircle className="text-destructive size-12" />
              <h1 className="text-xl font-bold">{errorMessage}</h1>
              <Button asChild>
                <Link to="/login">{auth.register.loginButton}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { organizationName: orgName } = inviteData;

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
          <Logo size={40} />
          <span className="text-sm font-black tracking-tight uppercase opacity-70">
            {app.name} / {auth.invite.title}
          </span>
        </div>

        <div className="relative">
          <h2 className="relative z-10 text-6xl leading-tight font-black tracking-tighter xl:text-7xl">
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
          <div className="mb-8 lg:hidden">
            <Logo size={48} showText />
          </div>

          <Card className="relative rounded-none p-0 shadow-2xl">
            <CardContent className="p-8 lg:p-10">
              <div className="mb-8 flex items-center justify-between border-b pb-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {auth.invite.joining.replace(
                      "{orgName}",
                      orgName || auth.invite.orgFallback,
                    )}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs font-medium">
                    {auth.invite.welcomeMessage}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-lg font-bold">
                  {(orgName || "?").charAt(0).toUpperCase()}
                </div>
              </div>

              {canAcceptAsCurrentUser ? (
                <div className="space-y-5">
                  {session?.user?.email ? (
                    <div
                      className="text-muted-foreground text-xs font-semibold"
                      dir="ltr"
                    >
                      {session.user.email}
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                    onClick={acceptAsCurrentUser}
                  >
                    <span className="flex items-center gap-2">
                      {submitting
                        ? auth.invite.joiningButton
                        : auth.invite.joinButton}
                      {!submitting && (
                        <IconFingerprint className="size-5 transition-transform group-hover:rotate-12" />
                      )}
                    </span>
                  </Button>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
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
                        <Label className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                          {auth.register.password}
                        </Label>
                        <IconShieldLock className="text-muted-foreground/40 size-3" />
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
                          {auth.register.confirmPassword}
                        </Label>
                        <IconShieldLock className="text-muted-foreground/40 size-3" />
                      </div>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="font-bold"
                        placeholder={auth.login.placeholders.password}
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
                      size="lg"
                      className="w-full"
                      disabled={submitting}
                    >
                      <span className="flex items-center gap-2">
                        {submitting
                          ? auth.invite.joiningButton
                          : auth.invite.joinButton}
                        {!submitting && (
                          <IconFingerprint className="size-5 transition-transform group-hover:rotate-12" />
                        )}
                      </span>
                    </Button>
                  </form>
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <span className="text-muted-foreground text-xs font-semibold">
                      {auth.invite.loginPrompt}
                    </span>
                    <Button variant="ghost" asChild>
                      <Link to={loginPathFor(`/invite/${token ?? ""}`)}>
                        {auth.register.loginButton}
                      </Link>
                    </Button>
                  </div>
                </>
              )}
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

export { InviteAccept };
