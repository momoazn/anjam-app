export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card rounded-xl border p-5 shadow-xs">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}
