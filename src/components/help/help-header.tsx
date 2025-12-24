import { HelpCircle } from "lucide-react";

import { helps } from "@/constants";

export function HelpHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />
          {helps.title}
        </h1>
        <p className="text-muted-foreground mt-2">{helps.description}</p>
      </div>
    </div>
  );
}
