import { Kbd } from "@/components/ui/kbd";
import { helps } from "@/constants";

// Shared by the help page and the "?" dialog, so they cannot drift apart.
export function ShortcutList() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {Object.values(helps.shortcuts).map((group) => (
        <section key={group.title} className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-semibold">
            {group.title}
          </h3>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm">{item.label}</span>
                <span dir="ltr" className="flex items-center gap-1">
                  {item.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
