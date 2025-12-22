import { PageTransition } from "@/components/page-transition";
import { HelpCategories } from "@/components/help/help-categories";
import { HelpHeader } from "@/components/help/help-header";
import { Separator } from "@/components/ui/separator";

export default function Helps() {
  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <HelpHeader />
      <Separator className="mb-6" />
      <HelpCategories />
    </PageTransition>
  );
}
