import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconChartBar } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { reports } from "@/constants";

interface ReportsSkeletonProps {
  rangeLabel: string;
}

export function ReportsSkeleton({ rangeLabel }: ReportsSkeletonProps) {
  return (
    <PageTransition className="container mx-auto max-w-7xl p-6 md:p-10">
      <div className="flex flex-col gap-8">
        <PageHeader
          title={reports.dashboardTitle}
          description={`${reports.range.label} ${digitsEnToFa(rangeLabel)}`}
          icon={IconChartBar}
        />

        <div className="space-y-16">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-primary/60 text-[10px] font-bold tracking-tight">
                Configuration
              </span>
              <div className="bg-border/20 h-px flex-1" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-primary/60 text-[10px] font-bold tracking-tight">
                Statistics Summary
              </span>
              <div className="bg-border/20 h-px flex-1" />
            </div>
            <Card className="border-border/40 overflow-hidden rounded-2xl shadow-sm">
              <CardContent className="bg-border/40 grid grid-cols-1 gap-px border-none p-0 md:grid-cols-5">
                {["s1", "s2", "s3", "s4", "s5"].map((key) => (
                  <div key={key} className="bg-card h-32 p-8">
                    <Skeleton className="mb-4 h-4 w-20 rounded-md" />
                    <Skeleton className="h-10 w-16 rounded-md" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
