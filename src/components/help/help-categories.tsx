import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpArticle } from "@/components/help/help-article";
import { helps } from "@/constants";

export function HelpCategories() {
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
  } = helps.content;

  const problems = [
    troubleshooting.problems.login,
    troubleshooting.problems.blocked,
    troubleshooting.problems.noTasks,
    troubleshooting.problems.cannotCreate,
    troubleshooting.problems.reportsEmpty,
    troubleshooting.problems.notifications,
  ];

  return (
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
          <HelpArticle title={gettingStarted.title}>
            <ol className="list-inside list-decimal space-y-2">
              {gettingStarted.steps.map((step, index) => (
                <li key={index}>
                  <span className="font-medium">{step.label}:</span>{" "}
                  {step.description}
                </li>
              ))}
            </ol>
          </HelpArticle>

          <HelpArticle title={gettingStarted.keyboardShortcuts.title}>
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
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="features">
        <AccordionTrigger className="text-lg md:text-xl">
          {features.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4" data-animate-stagger>
          {features.items.map((section) => (
            <HelpArticle key={section.title} title={section.title}>
              <ul className="list-inside list-disc space-y-1">
                {section.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </HelpArticle>
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
          <HelpArticle title={projects.about.title}>
            <p>{projects.about.description}</p>
            <ul className="list-inside list-disc space-y-1 pt-2">
              {projects.about.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={projects.createEdit.title}>
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
          </HelpArticle>

          <HelpArticle title={projects.members.title}>
            <ul className="list-inside list-disc space-y-1">
              {projects.members.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={projects.access.title}>
            <ul className="list-inside list-disc space-y-1">
              {projects.access.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tasks">
        <AccordionTrigger className="text-lg md:text-xl">
          {tasks.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <HelpArticle title={tasks.about.title}>
            <p>{tasks.about.description}</p>
            <ul className="list-inside list-disc space-y-1 pt-2">
              {tasks.about.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={tasks.statuses.title}>
            <ul className="list-inside list-disc space-y-1">
              {tasks.statuses.items.map((status, index) => (
                <li key={index}>
                  <span className="font-medium">{status.title}:</span>{" "}
                  {status.description}
                </li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={tasks.priorities.title}>
            <ul className="list-inside list-disc space-y-1">
              {tasks.priorities.items.map((priority, index) => (
                <li key={index}>
                  <span className="font-medium">{priority.title}:</span>{" "}
                  {priority.description}
                </li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={tasks.createEdit.title}>
            <p>{tasks.createEdit.description}</p>
            <ol className="list-inside list-decimal space-y-1 pt-2">
              {tasks.createEdit.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </HelpArticle>

          <HelpArticle title={tasks.tips.title}>
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
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="filters">
        <AccordionTrigger className="text-lg md:text-xl">
          {filters.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <HelpArticle title={filters.tags.title}>
              <ul className="list-inside list-disc space-y-1">
                {filters.tags.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </HelpArticle>
            <HelpArticle title={filters.savedFilters.title}>
              <ul className="list-inside list-disc space-y-1">
                {filters.savedFilters.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </HelpArticle>
            <HelpArticle title={filters.views.title}>
              <ul className="list-inside list-disc space-y-1">
                {filters.views.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </HelpArticle>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="collaboration">
        <AccordionTrigger className="text-lg md:text-xl">
          {collaboration.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <HelpArticle title={collaboration.notifications.title}>
            <ul className="list-inside list-disc space-y-1">
              {collaboration.notifications.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>
          <HelpArticle title={collaboration.comments.title}>
            <ul className="list-inside list-disc space-y-1">
              {collaboration.comments.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="reports">
        <AccordionTrigger className="text-lg md:text-xl">
          {reports.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <HelpArticle title={reports.analytics.title}>
            <ul className="list-inside list-disc space-y-1">
              {reports.analytics.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>
          <HelpArticle title={reports.time.title}>
            <ul className="list-inside list-disc space-y-1">
              {reports.time.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="troubleshooting">
        <AccordionTrigger className="text-lg md:text-xl">
          {troubleshooting.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <HelpArticle title={troubleshooting.problems.title}>
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
          </HelpArticle>

          <HelpArticle title={troubleshooting.support.title}>
            <p className="text-muted-foreground text-sm">
              {troubleshooting.support.description}
            </p>
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="system">
        <AccordionTrigger className="text-lg md:text-xl">
          {system.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <HelpArticle title={system.security.title}>
            <ul className="list-inside list-disc space-y-1">
              {system.security.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={system.ui.title}>
            <ul className="list-inside list-disc space-y-1">
              {system.ui.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>

          <HelpArticle title={system.performance.title}>
            <ul className="list-inside list-disc space-y-1">
              {system.performance.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </HelpArticle>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
