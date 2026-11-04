import {
  IconAlertTriangle,
  IconBook,
  IconList,
  IconShield,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

import { ShortcutList } from "@/components/help/shortcut-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { helps } from "@/constants";

const icons: Record<string, ComponentType<{ className?: string }>> = {
  start: IconBook,
  tasks: IconList,
  roles: IconShield,
  trouble: IconAlertTriangle,
};

export function HelpCategories() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="start"
      className="bg-card w-full divide-y overflow-hidden rounded-2xl border"
    >
      {helps.sections.map((section) => {
        const Icon = icons[section.id];
        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-none"
          >
            <AccordionTrigger className="hover:bg-muted/40 px-5 py-4 text-sm font-semibold hover:no-underline">
              <span className="flex items-center gap-3">
                <Icon className="text-primary size-5" />
                {section.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <ul className="space-y-3 text-sm leading-7">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <span className="font-semibold">{item.label}: </span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}

      <AccordionItem value="shortcuts" className="border-none">
        <AccordionTrigger className="hover:bg-muted/40 px-5 py-4 text-sm font-semibold hover:no-underline">
          {helps.shortcutsTitle}
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <ShortcutList />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
