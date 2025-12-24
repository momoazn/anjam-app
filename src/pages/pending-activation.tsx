import { useNavigate } from "react-router-dom";
import {
  IconClock,
  IconMail,
  IconTerminal,
  IconShieldCheck,
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
        className="bg-card border-foreground relative z-10 w-full max-w-xl overflow-hidden rounded-none border-2 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)]"
        disableStagger
      >
        <div className="bg-muted/20 border-foreground flex items-center justify-between border-b-2 px-8 py-4">
          <div className="text-primary flex items-center gap-3">
            <IconTerminal className="size-4" />
            <span className="text-foreground text-[10px] font-black tracking-[0.3em] uppercase">
              Auth_Protocol :: Activation
            </span>
          </div>
          <IconShieldCheck className="text-primary/40 size-5" />
        </div>

        <div className="space-y-10 p-10 text-right">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="bg-primary/10 text-primary border-primary/20 flex h-24 w-24 items-center justify-center rounded-none border-2 shadow-[8px_8px_0px_0px_rgba(var(--primary),0.1)]">
              <IconClock className="h-12 w-12 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight uppercase">
                {usersText.pendingActivation.title}
              </h1>
              <p className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">
                System_Status :: Holding_Pattern
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-muted-foreground/80 leading-relaxed font-medium">
              {usersText.pendingActivation.message}
            </p>

            <div className="bg-muted/10 border-primary space-y-3 border-r-4 p-6">
              <div className="text-primary flex items-center justify-end gap-3">
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Operator_Instruction
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
              className="h-14 w-full rounded-none text-base font-black tracking-widest uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              size="lg"
            >
              {usersText.pendingActivation.backToLogin}
            </Button>
          </div>
        </div>

        {/* Verification Metadata */}
        <div className="bg-muted/20 border-border/10 flex items-center justify-between border-t px-8 py-2 opacity-30">
          <span className="text-[7px] font-black tracking-[0.3em] uppercase">
            Integrity_Check :: PASS
          </span>
          <span className="text-[7px] font-black tracking-[0.3em] uppercase">
            {app.name}_Core_Auth
          </span>
        </div>
      </PageTransition>
    </div>
  );
}
