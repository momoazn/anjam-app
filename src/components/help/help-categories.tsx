import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpArticle } from "@/components/help/help-article";
import { helps } from "@/constants";
import {
  IconTerminal,
  IconBook,
  IconCpu,
  IconShield,
  IconTarget,
  IconList,
  IconFilter,
  IconMessages,
  IconChartBar,
  IconAlertTriangle,
} from "@tabler/icons-react";

export function HelpCategories() {
  const { gettingStarted, features, roles, troubleshooting } = helps.content;

  const problems = [
    troubleshooting.problems.login,
    troubleshooting.problems.blocked,
    troubleshooting.problems.noTasks,
    troubleshooting.problems.cannotCreate,
    troubleshooting.problems.reportsEmpty,
    troubleshooting.problems.notifications,
  ];

  const categories = [
    { id: "getting-started", title: gettingStarted.title, icon: IconBook },
    { id: "features", title: features.title, icon: IconCpu },
    { id: "roles", title: roles.title, icon: IconShield },
    { id: "projects", title: helps.content.projects.title, icon: IconTarget },
    { id: "tasks", title: helps.content.tasks.title, icon: IconList },
    { id: "filters", title: helps.content.filters.title, icon: IconFilter },
    {
      id: "collaboration",
      title: helps.content.collaboration.title,
      icon: IconMessages,
    },
    { id: "reports", title: helps.content.reports.title, icon: IconChartBar },
    {
      id: "troubleshooting",
      title: troubleshooting.title,
      icon: IconAlertTriangle,
    },
    { id: "system", title: helps.content.system.title, icon: IconTerminal },
  ];

  return (
    <Accordion
      type="single"
      collapsible
      className="bg-border/40 border-border/40 w-full space-y-px overflow-hidden border shadow-sm"
      data-animate-stagger
    >
      {categories.map((cat) => (
        <AccordionItem key={cat.id} value={cat.id} className="border-none">
          <AccordionTrigger className="bg-card hover:bg-muted/30 [&[data-state=open]]:bg-primary/5 [&[data-state=open]]:text-primary h-16 flex-row-reverse gap-4 px-6 transition-all hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-tight">
                {cat.title}
              </span>
              <cat.icon className="size-4.5" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/10 border-border/10 border-t p-0">
            <div className="space-y-10 p-8 text-right">
              {cat.id === "getting-started" && (
                <>
                  <HelpArticle title={gettingStarted.title}>
                    <ol className="me-4 space-y-3">
                      {gettingStarted.steps.map((step) => (
                        <li
                          key={step.label}
                          className="flex items-start justify-end gap-3"
                        >
                          <div className="flex-1">
                            <span className="text-primary/80 text-[11px] font-bold tracking-tight">
                              {step.label}:
                            </span>{" "}
                            <span className="text-sm leading-relaxed font-medium opacity-80">
                              {step.description}
                            </span>
                          </div>
                          <div className="bg-primary/20 mt-1 size-1.5 shrink-0" />
                        </li>
                      ))}
                    </ol>
                  </HelpArticle>

                  <HelpArticle title={gettingStarted.keyboardShortcuts.title}>
                    <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px border sm:grid-cols-2">
                      {gettingStarted.keyboardShortcuts.items.map((item) => (
                        <div
                          key={item.combo}
                          className="bg-card flex items-center justify-between p-3"
                        >
                          <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                            {item.description}
                          </span>
                          <kbd className="bg-muted/20 border-border/20 border px-2 py-0.5 font-mono text-[10px] font-bold">
                            {item.combo}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </HelpArticle>
                </>
              )}

              {cat.id === "features" && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {features.items.map((section) => (
                    <HelpArticle key={section.title} title={section.title}>
                      <ul className="me-4 space-y-2">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start justify-end gap-2 text-sm font-medium opacity-80"
                          >
                            <span>{item}</span>
                            <div className="bg-border mt-2 size-1 shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </HelpArticle>
                  ))}
                </div>
              )}

              {cat.id === "roles" && (
                <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px border md:grid-cols-2">
                  {roles.list.map((role) => (
                    <div
                      key={role.key}
                      className="bg-card space-y-4 p-[var(--ds-spacing-cardPadding)]"
                    >
                      <div className="border-border/10 flex items-center justify-end gap-2 border-b pb-2">
                        <h3 className="text-sm font-bold tracking-tight">
                          {role.title}
                        </h3>
                        <IconShield className="text-primary/40 size-3" />
                      </div>
                      <ul className="me-2 space-y-2">
                        {role.items.map((item) => (
                          <li
                            key={item}
                            className="text-muted-foreground/80 text-xs leading-relaxed font-bold"
                          >
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {cat.id === "troubleshooting" && (
                <div className="space-y-4">
                  {problems.map((problem) => (
                    <div
                      key={problem.title}
                      className="bg-muted/20 border-primary/20 border-e-2 p-4 text-right"
                    >
                      <h4 className="text-foreground mb-1 text-[11px] font-bold tracking-tight">
                        {problem.title}
                      </h4>
                      <p className="text-muted-foreground/60 text-xs leading-relaxed font-bold">
                        {problem.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {![
                "getting-started",
                "features",
                "roles",
                "troubleshooting",
              ].includes(cat.id) && (
                <div className="py-12 text-center opacity-40">
                  <IconTerminal className="mx-auto mb-4 size-10 stroke-[1]" />
                  <p className="text-[10px] font-bold tracking-tight">
                    Module_ :: Under_Expansion
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
