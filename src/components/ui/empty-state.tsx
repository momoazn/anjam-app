import type { ReactNode } from "react";
import {
  Activity,
  BellOff,
  Building2,
  FolderOpen,
  MessageCircle,
  SearchX,
  Users,
  ListTodo,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  projects,
  tasks,
  notifications,
  organization,
  comments,
  auditLogs,
} from "@/constants";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="rounded-xl border-dashed shadow-none">
      <CardContent
        className="flex flex-col items-center justify-center py-16 text-center"
        data-animate-stagger
      >
        <div className="text-muted-foreground/40 mb-6 h-16 w-16">{icon}</div>
        <h3 className="mb-2 text-xl font-bold tracking-tight">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
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
      icon={
        <FolderOpen className="h-12 w-12" />
      }
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
      icon={
        <FolderOpen className="h-12 w-12" />
      }
      title={projects.list.noProjects}
      description={organization.members.empty}
    />
  );
}

export function EmptyStateNoTasks({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={
        <ListTodo className="h-12 w-12" />
      }
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
      icon={
        <ListTodo className="h-12 w-12" />
      }
      title={tasks.emptyState.projectNoTasksYet}
      description={tasks.emptyState.projectNoTasksYetDescription}
    />
  );
}

export function EmptyStateNoResults() {
  return (
    <EmptyState
      icon={
        <SearchX className="h-12 w-12" />
      }
      title={tasks.emptyState.noTasksFound}
      description={tasks.emptyState.noTasksFoundDescription}
    />
  );
}

export function EmptyStateNoNotifications() {
  return (
    <EmptyState
      icon={
        <BellOff className="h-12 w-12" />
      }
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
      icon={
        <Building2 className="h-12 w-12" />
      }
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
      icon={
        <Users className="h-12 w-12" />
      }
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
      icon={
        <MessageCircle className="h-12 w-12" />
      }
      title={comments.empty.noComments}
      description={comments.empty.beFirst}
    />
  );
}

export function EmptyStateNoActivity() {
  return (
    <EmptyState
      icon={
        <Activity className="h-12 w-12" />
      }
      title={auditLogs.activityStream.title}
      description={auditLogs.activityStream.empty}
    />
  );
}
