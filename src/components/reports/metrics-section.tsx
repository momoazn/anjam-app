import { MetricCards } from "@/components/reports/metric-cards";
import type { computeOverviewMetrics } from "@/lib/reports";

type MetricsSectionProps = {
  totals: ReturnType<typeof computeOverviewMetrics> | null;
};

export function MetricsSection({ totals }: MetricsSectionProps) {
  if (!totals) return null;

  return (
    <div className="mb-6" data-animate-stagger>
      <MetricCards totals={totals} />
    </div>
  );
}
