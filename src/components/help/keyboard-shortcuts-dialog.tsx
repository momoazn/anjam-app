import {
  IconCommand,
  IconLetterC,
  IconLetterD,
  IconLetterI,
  IconLetterM,
  IconLetterN,
  IconLetterP,
  IconLetterS,
  IconLetterT,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { keyboardShortcuts } from "@/constants";

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        // Only trigger if not in an input
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCommand className="size-5" />
            میان‌برهای کیبورد
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-8 py-4 md:grid-cols-2" dir="rtl">
          <section className="space-y-4">
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              عمومی
            </h3>
            <div className="space-y-3">
              <ShortcutRow
                keys={[<Kbd key="c">{keyboardShortcuts.keys.c}</Kbd>]}
                label="ایجاد تسک جدید"
                icon={<IconLetterC className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="mod">{keyboardShortcuts.keys.cmd}</Kbd>,
                  <Kbd key="k">{keyboardShortcuts.keys.k}</Kbd>,
                ]}
                label="منوی دستورات / جستجو"
                icon={<IconCommand className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="?">{keyboardShortcuts.keys.question}</Kbd>]}
                label="نمایش این راهنما"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              ناوبری (برو به...)
            </h3>
            <div className="space-y-3">
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="d">{keyboardShortcuts.keys.d}</Kbd>,
                ]}
                label="داشبورد"
                icon={<IconLetterD className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="i">{keyboardShortcuts.keys.i}</Kbd>,
                ]}
                label="صندوق ورودی (Inbox)"
                icon={<IconLetterI className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="t">{keyboardShortcuts.keys.t}</Kbd>,
                ]}
                label="همه تسک‌ها"
                icon={<IconLetterT className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="m">{keyboardShortcuts.keys.m}</Kbd>,
                ]}
                label="تسک‌های من"
                icon={<IconLetterM className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="p">{keyboardShortcuts.keys.p}</Kbd>,
                ]}
                label="پروژه‌ها"
                icon={<IconLetterP className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="n">{keyboardShortcuts.keys.n}</Kbd>,
                ]}
                label="اعلان‌ها"
                icon={<IconLetterN className="size-4" />}
              />
              <ShortcutRow
                keys={[
                  <Kbd key="g">{keyboardShortcuts.keys.g}</Kbd>,
                  <Kbd key="s">{keyboardShortcuts.keys.s}</Kbd>,
                ]}
                label="تنظیمات"
                icon={<IconLetterS className="size-4" />}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({
  keys,
  label,
  icon,
}: {
  keys: React.ReactNode[];
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {icon && <div className="text-muted-foreground/60">{icon}</div>}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span
            key={`key-${key?.toString()}-${i}`}
            className="flex items-center gap-1"
          >
            {key}
            {i < keys.length - 1 && (
              <span className="text-muted-foreground/40 text-[10px]"></span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
