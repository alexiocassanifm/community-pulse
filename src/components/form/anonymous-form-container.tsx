"use client";

import { FormProvider } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-multi-step-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepIndicator } from "./step-indicator";
import { FormNavigation } from "./form-navigation";
import { PrivacyNotice } from "./privacy-notice";
import { ProfessionalBackground } from "./sections/professional-background";
import { Availability } from "./sections/availability";
import { EventFormatsSection } from "./sections/event-formats-placeholder";
import { TopicsSection } from "./sections/topics-placeholder";
import { GdprConsent } from "./sections/gdpr-consent";
import { SubmissionSuccessModal } from "./submission-success-modal";
import { AlreadySubmittedMessage } from "./already-submitted-message";

export function AnonymousFormContainer() {
  const {
    form,
    currentStep,
    stepStates,
    progress,
    goToNext,
    goToPrevious,
    goToStep,
    handleFormSubmit,
    isSubmitting,
    showSuccessModal,
    setShowSuccessModal,
    hasAlreadySubmitted,
    submissionTimestamp,
  } = useMultiStepForm();

  if (hasAlreadySubmitted) {
    return <AlreadySubmittedMessage timestamp={submissionTimestamp} />;
  }

  // Determine which section to render
  const renderCurrentSection = () => {
    switch (currentStep) {
      case 0:
        return <ProfessionalBackground form={form} />;
      case 1:
        return <Availability form={form} />;
      case 2:
        return <EventFormatsSection form={form} />;
      case 3:
        return <TopicsSection form={form} />;
      case 4:
        return <GdprConsent form={form} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="space-y-6">
          <PrivacyNotice />
          <StepIndicator
            steps={stepStates}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div
            className="min-h-[400px] transition-opacity duration-200"
            role="region"
            aria-live="polite"
            aria-label="Form section"
          >
            {renderCurrentSection()}
          </div>

          <FormNavigation
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === stepStates.length - 1}
            isSubmitting={isSubmitting}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSubmit={handleFormSubmit}
          />
        </CardContent>
      </Card>

      <SubmissionSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </FormProvider>
  );
}
