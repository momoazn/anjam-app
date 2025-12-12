import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageTransition } from "@/components/page-transition";
import { Separator } from "@/components/ui/separator";
import { fa } from "@/constants/text";
import { HelpCircle } from "lucide-react";

export default function Helps() {
  const {
    gettingStarted,
    features,
    roles,
    projects,
    tasks,
    filters,
    collaboration,
    reports,
    troubleshooting,
    system,
  } = fa.helps.content;

  const problems = [
    troubleshooting.problems.login,
    troubleshooting.problems.blocked,
    troubleshooting.problems.noTasks,
    troubleshooting.problems.cannotCreate,
    troubleshooting.problems.reportsEmpty,
    troubleshooting.problems.notifications,
  ];

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />
            {fa.helps.title}
          </h1>
          <p className="text-muted-foreground mt-2">{fa.helps.description}</p>
        </div>
      </div>
      <Separator className="mb-6" />
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-4"
        data-animate-stagger
      >
        <AccordionItem value="getting-started">
          <AccordionTrigger className="text-lg md:text-xl">
            {gettingStarted.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4" data-animate-stagger>
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {gettingStarted.title}
              </h3>
              <ol className="list-inside list-decimal space-y-2">
                {gettingStarted.steps.map((step, index) => (
                  <li key={index}>
                    <span className="font-medium">{step.label}:</span>{" "}
                    {step.description}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {gettingStarted.keyboardShortcuts.title}
              </h3>
              <div
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                data-animate-stagger
              >
                {gettingStarted.keyboardShortcuts.items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded border p-2"
                    data-interactive-item
                  >
                    <code className="text-sm">{item.combo}</code>
                    <span className="text-muted-foreground mr-2">
                      : {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger className="text-lg md:text-xl">
            {features.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4" data-animate-stagger>
            {features.items.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-lg font-semibold">{section.title}</h3>
                <ul className="list-inside list-disc space-y-1">
                  {section.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="roles">
          <AccordionTrigger className="text-lg md:text-xl">
            {roles.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4" data-animate-stagger>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {roles.list.map((role) => (
                <div key={role.key} className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-semibold">{role.title}</h3>
                  <ul className="list-inside list-disc space-y-1">
                    {role.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="projects">
          <AccordionTrigger className="text-lg md:text-xl">
            {projects.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {projects.about.title}
              </h3>
              <p>{projects.about.description}</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                {projects.about.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {projects.createEdit.title}
              </h3>
              <p>{projects.createEdit.description}</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                {projects.createEdit.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <p className="mt-4">{projects.createEdit.afterCreate}</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                {projects.createEdit.afterSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {projects.members.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {projects.members.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {projects.access.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {projects.access.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tasks">
          <AccordionTrigger className="text-lg md:text-xl">
            {tasks.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {tasks.about.title}
              </h3>
              <p>{tasks.about.description}</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                {tasks.about.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {tasks.statuses.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {tasks.statuses.items.map((status, index) => (
                  <li key={index}>
                    <span className="font-medium">{status.title}:</span>{" "}
                    {status.description}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {tasks.priorities.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {tasks.priorities.items.map((priority, index) => (
                  <li key={index}>
                    <span className="font-medium">{priority.title}:</span>{" "}
                    {priority.description}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {tasks.createEdit.title}
              </h3>
              <p>{tasks.createEdit.description}</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                {tasks.createEdit.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {tasks.tips.title}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tasks.tips.cards.map((tip, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <h4 className="text-sm font-medium">{tip.title}</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {tip.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="filters">
          <AccordionTrigger className="text-lg md:text-xl">
            {filters.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <h3 className="mb-2 text-base font-semibold md:text-lg">
                  {filters.tags.title}
                </h3>
                <ul className="list-inside list-disc space-y-1">
                  {filters.tags.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-base font-semibold md:text-lg">
                  {filters.savedFilters.title}
                </h3>
                <ul className="list-inside list-disc space-y-1">
                  {filters.savedFilters.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-base font-semibold md:text-lg">
                  {filters.views.title}
                </h3>
                <ul className="list-inside list-disc space-y-1">
                  {filters.views.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collaboration">
          <AccordionTrigger className="text-lg md:text-xl">
            {collaboration.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {collaboration.notifications.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {collaboration.notifications.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {collaboration.comments.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {collaboration.comments.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reports">
          <AccordionTrigger className="text-lg md:text-xl">
            {reports.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {reports.analytics.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {reports.analytics.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {reports.time.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {reports.time.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="troubleshooting">
          <AccordionTrigger className="text-lg md:text-xl">
            {troubleshooting.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {troubleshooting.problems.title}
              </h3>
              <div className="space-y-3">
                {problems.map((problem, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <h4 className="text-sm font-medium">{problem.title}</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {problem.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {troubleshooting.support.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {troubleshooting.support.description}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="system">
          <AccordionTrigger className="text-lg md:text-xl">
            {system.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {system.security.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {system.security.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {system.ui.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {system.ui.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {system.performance.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {system.performance.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </PageTransition>
  );
}
