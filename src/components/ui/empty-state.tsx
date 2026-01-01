import {
  Activity,
  BellOff,
  Building2,
  FolderOpen,
  ListTodo,
  MessageCircle,
  SearchX,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TechnicalLabel } from "@/components/ui/technical-label";
import {
  auditLogs,
  comments,
  notifications,
  organization,
  projects,
  tasks,
  users,
} from "@/constants";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="bg-dot-pattern rounded-2xl border-dashed shadow-none">
      <CardContent
        className="bg-background/80 flex flex-col items-center justify-center py-16 text-center backdrop-blur-[2px]"
        data-animate-stagger
      >
        <div className="text-primary/20 bg-primary/5 mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/10">
          <div className="h-10 w-10">{icon}</div>
        </div>
        <TechnicalLabel className="mb-2 text-sm font-black text-foreground opacity-100">
          {title}
        </TechnicalLabel>
        {description && (
          <p className="text-muted-foreground mb-10 max-w-sm text-xs leading-relaxed font-medium">
            {description}
          </p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}

export function EmptyStateNoProjects({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title={projects.list.noProjects}
      description={projects.create.description}
      action={
        onCreate ? (
          <Button className="gap-2" onClick={onCreate}>
            {projects.create.button}
          </Button>
        ) : null
      }
    />
  );
}

export function EmptyStateNoProjectsAccess() {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title={projects.list.noProjects}
      description={organization.members.empty}
    />
  );
}

export function EmptyStateNoTasks({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<ListTodo className="h-12 w-12" />}
      title={tasks.emptyState.noTasksYet}
      description={tasks.emptyState.noTasksYetDescription}
      action={
        onCreate ? (
          <Button className="gap-2" onClick={onCreate}>
            {tasks.emptyState.createFirstTask}
          </Button>
        ) : null
      }
    />
  );
}

export function EmptyStateNoTasksViewer() {
  return (
    <EmptyState
      icon={<ListTodo className="h-12 w-12" />}
      title={tasks.emptyState.projectNoTasksYet}
      description={tasks.emptyState.projectNoTasksYetDescription}
    />
  );
}

export function EmptyStateNoResults() {
  return (
    <EmptyState
      icon={<SearchX className="h-12 w-12" />}
      title={tasks.emptyState.noTasksFound}
      description={tasks.emptyState.noTasksFoundDescription}
    />
  );
}

export function EmptyStateNoNotifications() {
  return (
    <EmptyState
      icon={<BellOff className="h-12 w-12" />}
      title={notifications.emptyState.title}
      description={notifications.emptyState.description}
    />
  );
}

export function EmptyStateNoOrganization({
  onSelect,
}: {
  onSelect?: () => void;
}) {
  return (
    <EmptyState
      icon={<Building2 className="h-12 w-12" />}
      title={organization.title}
      description={organization.create.formDescription}
      action={
        onSelect ? (
          <Button className="gap-2" onClick={onSelect}>
            {organization.create.button}
          </Button>
        ) : null
      }
    />
  );
}

export function EmptyStateNoMembers({ onInvite }: { onInvite?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title={organization.members.empty}
      description={organization.members.invite}
      action={
        onInvite ? (
          <Button className="gap-2" onClick={onInvite}>
            {organization.members.invite}
          </Button>
        ) : null
      }
    />
  );
}

export function EmptyStateNoComments() {
  return (
    <EmptyState
      icon={<MessageCircle className="h-12 w-12" />}
      title={comments.empty.noComments}
      description={comments.empty.beFirst}
    />
  );
}

export function EmptyStateNoActivity() {
  return (
    <EmptyState
      icon={<Activity className="h-12 w-12" />}
      title={auditLogs.activityStream.title}
      description={auditLogs.activityStream.empty}
    />
  );
}

export function EmptyStateNoUsers({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title={users.emptyState.title}
      description={users.emptyState.description}
      action={
        onCreate ? (
          <Button className="gap-2" onClick={onCreate}>
            {users.create.button}
          </Button>
        ) : null
      }
    />
  );
}

export function EmptyStateNoProjectMembers({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title={projects.users.emptyState.title}
      description={projects.users.emptyState.description}
      action={
        onAdd ? (
          <Button className="gap-2" onClick={onAdd}>
            {projects.users.add}
          </Button>
        ) : null
      }
    />
  );
}
