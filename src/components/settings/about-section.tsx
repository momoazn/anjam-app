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
            <h3 className="text-sm font-black tracking-tight uppercase">
              {settings.about.title}
            </h3>
          </div>
          <div className="h-0.5 flex-1 bg-black" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-black bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <IconCircleCheck className="h-8 w-8" />
          </div>

          <div className="flex-1 text-right">
            <div className="mb-1 flex items-center justify-end gap-2">
              <span className="text-primary font-mono text-[9px] font-black tracking-widest uppercase">
                Software_Manifest
              </span>
            </div>
            <h3 className="mb-1 text-2xl font-black tracking-tight uppercase">
              {app.name}
            </h3>
            <div className="bg-muted/20 mb-4 inline-flex items-center gap-2 border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <span className="font-mono text-[8px] font-black tracking-tight uppercase opacity-40">
                Build_Version
              </span>
              <div className="h-2.5 w-0.5 bg-black/20" />
              <span className="text-[10px] font-black tabular-nums">
                {digitsEnToFa(settings.about.version)}
              </span>
            </div>

            <p className="text-muted-foreground font-mono text-xs leading-relaxed font-bold tracking-tight uppercase">
              {settings.about.description}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/5 border-2 border-black p-3 text-right shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <span className="text-muted-foreground/40 mb-1 block font-mono text-[7px] font-black tracking-tight uppercase">
              Architecture
            </span>
            <span className="text-[10px] font-black uppercase">
              PocketBase_Framework
            </span>
          </div>
          <div className="bg-muted/5 border-2 border-black p-3 text-right shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <span className="text-muted-foreground/40 mb-1 block font-mono text-[7px] font-black tracking-tight uppercase">
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
