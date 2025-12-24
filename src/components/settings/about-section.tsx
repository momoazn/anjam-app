import { IconCircleCheck, IconTerminal } from "@tabler/icons-react";

import { app, settings } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";

export function AboutSection() {
  return (
    <div className="space-y-12" data-animate-stagger>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconTerminal className="text-primary/60 size-4" />
            <h3 className="text-sm font-black tracking-widest uppercase">
              {settings.about.title}
            </h3>
          </div>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="bg-primary text-primary-foreground border-primary/30 flex h-24 w-24 shrink-0 items-center justify-center rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(var(--primary),0.2)]">
            <IconCircleCheck className="h-10 w-10" />
          </div>

          <div className="flex-1 text-right">
            <div className="mb-2 flex items-center justify-end gap-3">
              <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
                Software_Manifest
              </span>
            </div>
            <h3 className="mb-2 text-3xl font-black tracking-tight uppercase">
              {app.name}
            </h3>
            <div className="bg-muted/20 border-border/20 mb-6 inline-flex items-center gap-2 rounded-none border px-3 py-1">
              <span className="text-[9px] font-black tracking-widest uppercase opacity-40">
                Build_Version
              </span>
              <div className="bg-border/40 h-3 w-px" />
              <span className="text-[10px] font-black tabular-nums">
                {digitsEnToFa(settings.about.version)}
              </span>
            </div>

            <p className="text-muted-foreground/80 text-sm leading-relaxed font-bold tracking-widest uppercase">
              {settings.about.description}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border/20 border-t pt-12">
        <div className="bg-border/40 border-border/40 grid grid-cols-2 gap-px border">
          <div className="bg-muted/5 p-4 text-right">
            <span className="text-muted-foreground/40 mb-1 block text-[8px] font-black tracking-[0.2em] uppercase">
              Architecture
            </span>
            <span className="text-[10px] font-black uppercase">
              PocketBase_Framework
            </span>
          </div>
          <div className="bg-muted/5 p-4 text-right">
            <span className="text-muted-foreground/40 mb-1 block text-[8px] font-black tracking-[0.2em] uppercase">
              UI_Engine
            </span>
            <span className="text-[10px] font-black uppercase">
              React_Tailwind_Industrial
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
