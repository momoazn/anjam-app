import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconBrandGithub } from "@tabler/icons-react";

import { SettingsCard } from "@/components/settings/settings-card";
import { app, settings } from "@/constants";

export function AboutSection() {
  return (
    <div className="space-y-4">
      <SettingsCard title={app.name}>
        <p className="text-muted-foreground text-sm leading-7">
          {settings.about.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span>
            {settings.about.version}{" "}
            <span className="font-medium tabular-nums">
              {digitsEnToFa(__APP_VERSION__)}
            </span>
          </span>
          <a
            href={app.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-sm outline-none hover:underline focus-visible:ring-2"
          >
            <IconBrandGithub className="size-4" aria-hidden />
            {settings.about.sourceCode}
          </a>
        </div>
      </SettingsCard>

      <SettingsCard title={settings.about.stackTitle}>
        <ul className="text-muted-foreground list-disc space-y-1 ps-5 text-sm">
          {settings.about.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SettingsCard>
    </div>
  );
}
