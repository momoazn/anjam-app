import { HelpCategories } from "@/components/help/help-categories";
import { HelpHeader } from "@/components/help/help-header";
import { PageTransition } from "@/components/page-transition";

export default function Helps() {
  return (
    <PageTransition
      data-testid="help-page"
      className="container mx-auto max-w-7xl p-4 md:p-6"
    >
      <HelpHeader />
      <HelpCategories />
    </PageTransition>
  );
}
