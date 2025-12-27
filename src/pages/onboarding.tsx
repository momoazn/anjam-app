import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconPhotoPlus,
  IconFileDescription,
  IconUserPlus,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { useCurrentOrganization, useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/hooks/query-keys";
import { handlePocketBaseError } from "@/lib/error-handler";

const STEPS = [
  {
    id: 1,
    title: auth.onboarding.step1.title,
    description: auth.onboarding.step1.description,
    icon: IconPhotoPlus,
  },
  {
    id: 2,
    title: auth.onboarding.step2.title,
    description: auth.onboarding.step2.description,
    icon: IconFileDescription,
  },
  {
    id: 3,
    title: auth.onboarding.step3.title,
    description: auth.onboarding.step3.description,
    icon: IconUserPlus,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentOrg = useCurrentOrganization();
  const fetchOrgs = useAuthStore((s) => s.fetchUserOrganizations);

  const [currentStep, setCurrentStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);

  // Mutation to complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization selected");

      // Update organization with logo and description if provided
      const formData = new FormData();
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (logoFile || description.trim()) {
        await pb.collection("organizations").update(currentOrg.id, formData);
      }

      // Process invite emails - create invite link if any valid emails provided
      const validEmails = inviteEmails.filter(
        (e) => e.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()),
      );
      if (validEmails.length > 0) {
        // Create an invite link with max uses equal to number of emails
        await fetch(`/api/v1/organizations/${currentOrg.id}/invites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "member",
            max_uses: validEmails.length,
          }),
        });
        // Note: In a production app, you'd send emails with the invite link here
      }

      // Mark onboarding as completed for current user's membership
      const memberships = await pb
        .collection("organization_members")
        .getFullList({
          filter: `organization = "${currentOrg.id}" && user = "${pb.authStore.record?.id}"`,
        });

      if (memberships.length > 0) {
        await pb.collection("organization_members").update(memberships[0].id, {
          onboarding_completed: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgMembers.all });
      fetchOrgs();
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          <div className="flex flex-col items-center gap-6">
            <div
              className="border-border bg-muted/30 hover:border-primary/50 relative flex size-32 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-colors"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="size-full object-cover"
                />
              ) : (
                <IconPhotoPlus className="text-muted-foreground size-12" />
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {auth.onboarding.step1.description}
            </p>
          </div>
        );
      case 2:
        return (
          <div className="w-full space-y-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={auth.onboarding.step2.description}
              className="min-h-[150px] resize-none"
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
                  placeholder="email@example.com"
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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <PageTransition className="w-full max-w-md" disableStagger>
        <div className="bg-card rounded-none border p-8 shadow-2xl">
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
        </div>
      </PageTransition>
    </div>
  );
}
