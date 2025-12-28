import { User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MyTasksEmptyStateProps = {
  message: string;
  description: string;
};

export function MyTasksEmptyState({
  message,
  description,
}: MyTasksEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <User className="text-muted-foreground mb-4 h-[var(--ds-sizing-formControlHeight)] w-[var(--ds-sizing-formControlHeight)]" />
        <h3 className="mb-2 text-lg font-semibold">{message}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </CardContent>
    </Card>
  );
}
