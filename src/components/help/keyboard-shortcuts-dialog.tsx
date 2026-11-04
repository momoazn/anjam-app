import { IconCommand } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { ShortcutList } from "@/components/help/shortcut-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { helps } from "@/constants";

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "?" || e.key === "؟") && !e.metaKey && !e.ctrlKey) {
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
            {helps.shortcutsTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <ShortcutList />
        </div>
      </DialogContent>
    </Dialog>
  );
}
