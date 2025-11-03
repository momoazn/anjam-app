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
        {/* Getting Started Section */}
        <AccordionItem value="getting-started">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.gettingStarted.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4" data-animate-stagger>
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.gettingStarted.steps.title}
              </h3>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  <span className="font-medium">
                    {fa.helps.content.gettingStarted.steps.login.label}:
                  </span>{" "}
                  {fa.helps.content.gettingStarted.steps.login.description}
                </li>
                <li>
                  <span className="font-medium">
                    {fa.helps.content.gettingStarted.steps.dashboard.label}:
                  </span>{" "}
                  {fa.helps.content.gettingStarted.steps.dashboard.description}
                </li>
                <li>
                  <span className="font-medium">
                    {fa.helps.content.gettingStarted.steps.createProject.label}:
                  </span>{" "}
                  {
                    fa.helps.content.gettingStarted.steps.createProject
                      .description
                  }
                </li>
                <li>
                  <span className="font-medium">
                    {fa.helps.content.gettingStarted.steps.addMembers.label}:
                  </span>{" "}
                  {fa.helps.content.gettingStarted.steps.addMembers.description}
                </li>
                <li>
                  <span className="font-medium">
                    {fa.helps.content.gettingStarted.steps.createTasks.label}:
                  </span>{" "}
                  {
                    fa.helps.content.gettingStarted.steps.createTasks
                      .description
                  }
                </li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.gettingStarted.keyboardShortcuts.title}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" data-animate-stagger>
                <div className="rounded border p-2" data-interactive-item>
                  <code className="text-sm">Ctrl/Cmd + K</code>
                  <span className="text-muted-foreground mr-2">
                    :{" "}
                    {
                      fa.helps.content.gettingStarted.keyboardShortcuts
                        .focusSearch
                    }
                  </span>
                </div>
                <div className="rounded border p-2" data-interactive-item>
                  <code className="text-sm">Ctrl/Cmd + N</code>
                  <span className="text-muted-foreground mr-2">
                    :{" "}
                    {fa.helps.content.gettingStarted.keyboardShortcuts.newTask}
                  </span>
                </div>
                <div className="rounded border p-2" data-interactive-item>
                  <code className="text-sm">Ctrl/Cmd + P</code>
                  <span className="text-muted-foreground mr-2">
                    :{" "}
                    {fa.helps.content.gettingStarted.keyboardShortcuts.projects}
                  </span>
                </div>
                <div className="rounded border p-2" data-interactive-item>
                  <code className="text-sm">Ctrl/Cmd + D</code>
                  <span className="text-muted-foreground mr-2">
                    :{" "}
                    {
                      fa.helps.content.gettingStarted.keyboardShortcuts
                        .dashboard
                    }
                  </span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features Section */}
        <AccordionItem value="features">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.features.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4" data-animate-stagger>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.features.userManagement.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.features.userManagement.items.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.features.projectManagement.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.features.projectManagement.items.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.features.taskManagement.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.features.taskManagement.items.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.features.ui.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.features.ui.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* User Roles Section */}
        <AccordionItem value="roles">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.roles.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4" data-animate-stagger>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.roles.admin.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.roles.admin.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.roles.supervisor.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.roles.supervisor.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.roles.employee.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.roles.employee.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Projects Section */}
        <AccordionItem value="projects">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.projects.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.projects.about.title}
              </h3>
              <p>{fa.helps.content.projects.about.description}</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                {fa.helps.content.projects.about.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.projects.createEdit.title}
              </h3>
              <p>{fa.helps.content.projects.createEdit.description}</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                {fa.helps.content.projects.createEdit.steps.map(
                  (step, index) => (
                    <li key={index}>{step}</li>
                  ),
                )}
              </ol>
              <p className="mt-4">
                {fa.helps.content.projects.createEdit.afterCreate}
              </p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                {fa.helps.content.projects.createEdit.afterSteps.map(
                  (step, index) => (
                    <li key={index}>{step}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.projects.members.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.projects.members.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.projects.access.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.projects.access.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tasks Section */}
        <AccordionItem value="tasks">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.tasks.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.tasks.about.title}
              </h3>
              <p>{fa.helps.content.tasks.about.description}</p>
              <ul className="list-inside list-disc space-y-1 pt-2">
                {fa.helps.content.tasks.about.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
                {/* <li>تاریخ ایجاد و آخرین به‌روزرسانی</li> */}
                {/* <li>ایجادکننده تسک</li> */}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.tasks.statuses.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>{fa.helps.content.tasks.statuses.todo}</li>
                <li>{fa.helps.content.tasks.statuses.inProgress}</li>
                <li>{fa.helps.content.tasks.statuses.done}</li>
                <li>{fa.helps.content.tasks.statuses.canceled}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">
                {fa.helps.content.tasks.priorities.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                <li>{fa.helps.content.tasks.priorities.urgent}</li>
                <li>{fa.helps.content.tasks.priorities.high}</li>
                <li>{fa.helps.content.tasks.priorities.medium}</li>
                <li>{fa.helps.content.tasks.priorities.low}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.tasks.createEdit.title}
              </h3>
              <p>{fa.helps.content.tasks.createEdit.description}</p>
              <ol className="list-inside list-decimal space-y-1 pt-2">
                {fa.helps.content.tasks.createEdit.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.tasks.tips.title}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {fa.helps.content.tasks.tips.filterSearch.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {fa.helps.content.tasks.tips.filterSearch.description}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {fa.helps.content.tasks.tips.prioritization.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {fa.helps.content.tasks.tips.prioritization.description}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {fa.helps.content.tasks.tips.deadlines.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {fa.helps.content.tasks.tips.deadlines.description}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {fa.helps.content.tasks.tips.statusUpdates.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {fa.helps.content.tasks.tips.statusUpdates.description}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Troubleshooting Section */}
        <AccordionItem value="troubleshooting">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.troubleshooting.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.troubleshooting.problems.title}
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {fa.helps.content.troubleshooting.problems.login.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {
                      fa.helps.content.troubleshooting.problems.login
                        .description
                    }
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {fa.helps.content.troubleshooting.problems.noTasks.title}
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {
                      fa.helps.content.troubleshooting.problems.noTasks
                        .description
                    }
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {
                      fa.helps.content.troubleshooting.problems.cannotCreateTask
                        .title
                    }
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {
                      fa.helps.content.troubleshooting.problems.cannotCreateTask
                        .description
                    }
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">
                    {
                      fa.helps.content.troubleshooting.problems
                        .reportsNotLoading.title
                    }
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {
                      fa.helps.content.troubleshooting.problems
                        .reportsNotLoading.description
                    }
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.troubleshooting.support.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {fa.helps.content.troubleshooting.support.description}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* System Features Section */}
        <AccordionItem value="system">
          <AccordionTrigger className="text-lg md:text-xl">
            {fa.helps.content.system.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.system.security.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.system.security.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.system.ui.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.system.ui.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-semibold md:text-lg">
                {fa.helps.content.system.performance.title}
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {fa.helps.content.system.performance.items.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </PageTransition>
  );
}
