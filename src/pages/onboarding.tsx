import {
  IconArrowLeft,
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconFileDescription,
  IconFolderPlus,
  IconUserPlus,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Logo } from "@/components/brand/logo";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/constants";
import { useAuthStore, useCurrentOrganization } from "@/store/auth-store";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const STEPS = [
  {
    id: 1,
    title: auth.onboarding.step2.title,
    description: auth.onboarding.step2.description,
    icon: IconBuilding,
  },
  {
    id: 2,
    title: auth.onboarding.step3.title,
    description: auth.onboarding.step3.description,
    icon: IconFileDescription,
  },
  {
    id: 3,
    title: auth.onboarding.step4.title,
    description: auth.onboarding.step4.description,
    icon: IconUserPlus,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const currentOrg = useCurrentOrganization();
  const fetchOrgs = useAuthStore((s) => s.fetchUserOrganizations);

  // Convex mutations
  const createOrg = useConvexMutation(api.organizations.create);
  const updateOrg = useConvexMutation(api.organizations.update);
  const createProject = useConvexMutation(api.projects.create);
  const createInvite = useConvexMutation(api.invites.createLink);
  const setOnboardingCompleted = useConvexMutation(
    api.organizations.setOnboardingCompleted,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [orgName, setOrgName] = useState(currentOrg?.name || "");
  const [projectName, setProjectName] = useState("");
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);

  // Mutation to complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: async () => {
      let orgId = currentOrg?._id as Id<"organizations"> | undefined;

      // If no organization exists, create one first
      if (!orgId) {
        if (!orgName.trim()) {
          throw new Error("Organization name is required");
        }
        orgId = await createOrg({
          name: orgName.trim(),
        });
      }

      // Update organization name if changed and org was not just created
      if (orgName.trim() && currentOrg && orgName.trim() !== currentOrg.name) {
        await updateOrg({
          organizationId: orgId!,
          updates: {
            name: orgName.trim(),
          },
        });
      }

      // Create first project if name provided
      if (projectName.trim()) {
        await createProject({
          name: projectName.trim(),
          organizationId: orgId!,
        });
      }

      // Process invite emails - create invite link if any valid emails provided
      const validEmails = inviteEmails.filter(
        (e) => e.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()),
      );
      if (validEmails.length > 0) {
        // Create an invite link with max uses equal to number of emails
        await createInvite({
          organizationId: orgId!,
          maxUses: validEmails.length,
        });
        // Note: In a production app, you'd send emails with the invite link here
      }

      // Mark onboarding as completed for current user's membership
      await setOnboardingCompleted({
        organizationId: orgId!,
      });
    },
    onSuccess: () => {
      fetchOrgs();
      navigate("/inbox", { replace: true });
    },
    onError: (error) => {
      console.error(error);
      // toast.error("Failed to complete onboarding");
    },
  });

  const handleAddEmail = () => {
    setInviteEmails([...inviteEmails, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const handleRemoveEmail = (index: number) => {
    if (inviteEmails.length > 1) {
      setInviteEmails(inviteEmails.filter((_, i) => i !== index));
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding.mutate();
  };

  const handleFinish = () => {
    completeOnboarding.mutate();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/50 bg-muted/20 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <IconBuilding className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {auth.onboarding.step2.organizationName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {auth.onboarding.step2.organizationDescription}
                </p>
              </div>
            </div>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder={auth.register.organizationNamePlaceholder}
              dir="rtl"
              className="text-right"
            />
          </div>
        );
      case 2:
        return (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/50 bg-muted/20 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <IconFolderPlus className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {auth.onboarding.step3.createProject}
                </p>
                <p className="text-xs text-muted-foreground">
                  {auth.onboarding.step3.projectDescription}
                </p>
              </div>
            </div>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={auth.onboarding.step3.projectPlaceholder}
              dir="rtl"
              className="text-right"
            />
          </div>
        );
      case 3:
        return (
          <div className="w-full space-y-4">
            {inviteEmails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder={auth.onboarding.placeholders.email}
                  dir="ltr"
                  className="flex-1"
                />
                {inviteEmails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEmail(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddEmail}
              className="w-full"
            >
              <IconUserPlus className="mr-2 size-4" />
              افزودن ایمیل دیگر
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const CurrentIcon = STEPS[currentStep - 1].icon;

  return (
    <div className="bg-background flex h-svh items-center justify-center p-4">
      <PageTransition className="w-full max-w-md" disableStagger>
        <Card className="rounded-none p-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <Logo size={40} />
              <div>
                <h1 className="text-2xl font-black">{auth.onboarding.title}</h1>
                <p className="text-muted-foreground text-sm">
                  {auth.onboarding.subtitle}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8 flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-1 flex-col items-center gap-2 ${
                    step.id < currentStep
                      ? "text-primary"
                      : step.id === currentStep
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border-2 ${
                      step.id < currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : step.id === currentStep
                          ? "border-primary"
                          : "border-muted"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <IconCheck className="size-5" />
                    ) : (
                      <step.icon className="size-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="mb-8 min-h-[200px]">
              <div className="mb-4 flex items-center gap-3">
                <CurrentIcon className="text-primary size-6" />
                <h2 className="text-lg font-bold">
                  {STEPS[currentStep - 1].title}
                </h2>
              </div>
              {renderStepContent()}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t pt-6">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={completeOnboarding.isPending}
                  >
                    <IconArrowRight className="mr-2 size-4" />
                    {auth.onboarding.previous}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={completeOnboarding.isPending}
                >
                  {auth.onboarding.skip}
                </Button>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={completeOnboarding.isPending}
                  >
                    {auth.onboarding.next}
                    <IconArrowLeft className="ms-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    disabled={completeOnboarding.isPending}
                  >
                    {completeOnboarding.isPending
                      ? "..."
                      : auth.onboarding.finish}
                    <IconCheck className="ms-2 size-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  );
}
