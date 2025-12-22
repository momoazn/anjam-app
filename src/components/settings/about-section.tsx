import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { app, settings } from "@/constants";

export function AboutSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{settings.about.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{app.name}</h3>
              <p className="text-muted-foreground">{settings.about.version}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <p>{settings.about.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
