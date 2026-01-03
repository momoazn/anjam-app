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
                keys={[<Kbd key="c">C</Kbd>]}
                label="ایجاد تسک جدید"
                icon={<IconLetterC className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="mod">Cmd</Kbd>, <Kbd key="k">K</Kbd>]}
                label="منوی دستورات / جستجو"
                icon={<IconCommand className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="?">?</Kbd>]}
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
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="d">D</Kbd>]}
                label="داشبورد"
                icon={<IconLetterD className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="i">I</Kbd>]}
                label="صندوق ورودی (Inbox)"
                icon={<IconLetterI className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="t">T</Kbd>]}
                label="همه تسک‌ها"
                icon={<IconLetterT className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="m">M</Kbd>]}
                label="تسک‌های من"
                icon={<IconLetterM className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="p">P</Kbd>]}
                label="پروژه‌ها"
                icon={<IconLetterP className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="n">N</Kbd>]}
                label="اعلان‌ها"
                icon={<IconLetterN className="size-4" />}
              />
              <ShortcutRow
                keys={[<Kbd key="g">G</Kbd>, <Kbd key="s">S</Kbd>]}
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
            key={i === 0 ? "first" : "second"}
            className="flex items-center gap-1"
          >
            {key}
            {i < keys.length - 1 && (
              <span className="text-muted-foreground/40 text-[10px]">ثم</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
