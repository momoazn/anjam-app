import { IconCircleCheck, IconTerminal } from "@tabler/icons-react";

import { app, settings } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export function AboutSection() {
  return (
    <div className="space-y-8" data-animate-stagger>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconTerminal className="text-primary size-4" />
            <h3 className="text-sm font-bold tracking-tight">
              {settings.about.title}
            </h3>
          </div>
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="bg-primary/10 text-primary flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--ds-radius-card)]">
            <IconCircleCheck className="h-10 w-10" />
          </div>

          <div className="flex-1 text-right">
            <div className="mb-1 flex items-center justify-end gap-2">
              <span className="text-primary font-mono text-[9px] font-bold tracking-widest">
                Software_Manifest
              </span>
            </div>
            <h3 className="mb-1 text-2xl font-bold tracking-tight">
              {app.name}
            </h3>
            <div className="bg-muted/20 mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-0.5">
              <span className="font-mono text-[8px] font-bold tracking-tight opacity-40">
                Build_Version
              </span>
              <div className="bg-border h-2.5 w-px" />
              <span className="text-[10px] font-bold tabular-nums">
                {digitsEnToFa(settings.about.version)}
              </span>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed font-medium tracking-tight">
              {settings.about.description}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/5 border-border rounded-xl border p-3 text-right">
            <span className="text-muted-foreground/40 mb-1 block font-mono text-[7px] font-bold tracking-tight">
              Architecture
            </span>
            <span className="text-[10px] font-bold">PocketBase_Framework</span>
          </div>
          <div className="bg-muted/5 border-border rounded-xl border p-3 text-right">
            <span className="text-muted-foreground/40 mb-1 block font-mono text-[7px] font-bold tracking-tight">
              UI_Engine
            </span>
            <span className="text-[10px] font-bold">
              React_Tailwind_Minimal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
