import { useNavigate } from "react-router-dom";
import {
  IconClock,
  IconMail,
  IconShieldCheck,
  IconLock,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { users as usersText, app } from "@/constants";

export default function PendingActivation() {
  const navigate = useNavigate();

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Structural Decor */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px), linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "80px 80px, 40px 40px, 40px 40px",
        }}
      />

      <PageTransition
        className="bg-card border-border relative z-10 w-full max-w-xl overflow-hidden rounded-none border shadow-md"
        disableStagger
      >
        <div className="bg-muted/20 border-border flex items-center justify-between border-b px-8 py-4">
          <div className="text-primary flex items-center gap-3">
            <IconLock className="size-4" />
            <span className="text-foreground text-[10px] font-black tracking-tight uppercase">
              Authentication :: Activation
            </span>
          </div>
          <IconShieldCheck className="text-primary/40 size-5" />
        </div>

        <div className="space-y-10 p-10 text-right">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="bg-primary/10 text-primary border-primary/20 flex h-24 w-24 items-center justify-center rounded-none border shadow-sm">
              <IconClock className="h-12 w-12 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight uppercase">
                {usersText.pendingActivation.title}
              </h1>
              <p className="text-muted-foreground text-[10px] font-bold tracking-tight uppercase">
                Account Status :: Pending
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-muted-foreground/80 leading-relaxed font-medium">
              {usersText.pendingActivation.message}
            </p>

            <div className="bg-muted/10 border-primary space-y-3 rounded-none border-e-4 p-6">
              <div className="text-primary flex items-center justify-end gap-3">
                <span className="text-[10px] font-black tracking-tight uppercase">
                  Instruction
                </span>
                <IconMail className="size-4" />
              </div>
              <p className="text-sm leading-relaxed font-bold">
                {usersText.pendingActivation.instruction}
              </p>
            </div>
          </div>

          <div className="border-border/20 border-t pt-6">
            <Button
              onClick={() => navigate("/login")}
              className="h-14 w-full rounded-none text-base font-black tracking-tight uppercase shadow-sm transition-all active:scale-95"
              size="lg"
            >
              {usersText.pendingActivation.backToLogin}
            </Button>
          </div>
        </div>

        {/* Verification Metadata */}
        <div className="bg-muted/20 border-border/10 flex items-center justify-between border-t px-8 py-2 opacity-30">
          <span className="text-[7px] font-black tracking-tight uppercase">
            Security Check :: Passed
          </span>
          <span className="text-[7px] font-black tracking-tight uppercase">
            {app.name} Secure Auth
          </span>
        </div>
      </PageTransition>
    </div>
  );
}
