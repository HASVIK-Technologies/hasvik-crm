"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  type FieldErrors,
} from "react-hook-form";
import {
  ArrowRight,
  Check,
  FileText,
  Phone,
  Save,
  UsersRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import OutlinedButton from "@/components/common/OutlinedButton";
import SecondaryButton from "@/components/common/SecondaryButton";

import FormSection from "@/components/businesses/FormSection";
import BusinessInfoSection from "@/components/businesses/sections/BusinessInfoSection";
import ContactInfoSection from "@/components/businesses/sections/ContactInfoSection";
import AdditionalInfoSection from "@/components/businesses/sections/AdditionalInfoSection";
import FollowUpSection from "@/components/businesses/sections/FollowUpSection";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/lib/use-is-desktop";
import {
  defaultBusinessFormValues,
  STEP_FIELD_NAMES,
  type BusinessFormValues,
} from "@/lib/business-form-types";

// Additional Information is built out but hidden from view for now - the
// team plans to start using it in a future release. Flip this to `true`
// when it's ready to go live; the mobile stepper below picks up the extra
// step automatically, no other changes needed.
const SHOW_ADDITIONAL_INFORMATION = true;

// Friendly labels used to build the "Please fill in..." summary banner from
// whatever react-hook-form's `errors` object contains.
const FIELD_LABELS: Partial<Record<keyof BusinessFormValues, string>> = {
  businessName: "Business Name",
  category: "Category",
  city: "City",
  state: "State",
  pincode: "Pincode",
  address: "Address",
  status: "Status",
  phoneNumbers: "Phone Number",
  whatsappNumbers: "WhatsApp Number",
};

const describeErrors = (errors: FieldErrors<BusinessFormValues>): string[] =>
  (Object.keys(FIELD_LABELS) as (keyof BusinessFormValues)[])
    .filter((key) => Boolean(errors[key]))
    .map((key) => FIELD_LABELS[key] as string);

export default function BusinessForm() {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const methods = useForm<BusinessFormValues>({
    defaultValues: defaultBusinessFormValues,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { control, handleSubmit, trigger, getValues, reset } = methods;

  const [currentStep, setCurrentStep] = useState(0);
  const [stepAttempted, setStepAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const phoneArray = useFieldArray({ control, name: "phoneNumbers" });
  const whatsappArray = useFieldArray({ control, name: "whatsappNumbers" });


  const handleCancel = () => router.push("/businesses");

  const steps = [
    {
      key: "business",
      title: "Business Information",
      render: (idPrefix: string) => <BusinessInfoSection idPrefix={idPrefix} />,
    },
    {
      key: "contact",
      title: "Contact Information",
      render: (idPrefix: string) => (
        <ContactInfoSection
          idPrefix={idPrefix}
          phoneArray={phoneArray}
          whatsappArray={whatsappArray}
        />
      ),
    },
    ...(SHOW_ADDITIONAL_INFORMATION
      ? [
          {
            key: "additional",
            title: "Additional Information",
            render: (idPrefix: string) => (
              <AdditionalInfoSection idPrefix={idPrefix} />
            ),
          },
        ]
      : []),
    {
      key: "followup",
      title: "Follow-up Settings",
      render: (idPrefix: string) => <FollowUpSection idPrefix={idPrefix} />,
    },
  ];

  const isLastStep = currentStep === steps.length - 1;

  const fieldsForStep = (stepKey: string): string[] => {
    if (stepKey === "business") return [...STEP_FIELD_NAMES.business];
    if (stepKey === "contact") {
      return [
        ...getValues("phoneNumbers").map((_, i) => `phoneNumbers.${i}.value`),
        ...getValues("whatsappNumbers").map(
          (_, i) => `whatsappNumbers.${i}.value`,
        ),
      ];
    }
    if (stepKey === "additional") return [...STEP_FIELD_NAMES.additional];
    return [...STEP_FIELD_NAMES.followup];
  };

  const goNext = async () => {
    // Dynamic array-index paths (e.g. "phoneNumbers.0.value") aren't fully
    // expressible in react-hook-form's static Path<T> type, hence the cast.
    const isStepValid = await trigger(
      fieldsForStep(steps[currentStep].key) as never,
    );
    if (!isStepValid) {
      setStepAttempted(true);
      return;
    }
    setStepAttempted(false);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepAttempted(false);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const onValid = (values: BusinessFormValues) => {
    setSubmitError(null);

    // Persisting to the backend will be wired up separately - for now this
    // captures the shape of the payload the API will expect. Note the
    // shape: phoneNumbers/whatsappNumbers are `{ value: string }[]`.
    console.log("Saving business", values);

    if (values.addAnother) {
      reset(defaultBusinessFormValues);
      setCurrentStep(0);
    } else {
      router.push("/businesses");
    }
  };

  const onInvalid = (formErrors: FieldErrors<BusinessFormValues>) => {
    const missing = describeErrors(formErrors);
    setSubmitError(
      missing.length > 0
        ? `Please fill in the required fields: ${missing.join(", ")}`
        : "Please fix the highlighted fields before saving.",
    );
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        noValidate
        className="flex flex-col gap-4"
      >
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {isDesktop ? (
          // Desktop / tablet: every section shown at once on a single page
          <Card className="border-[#dce8ee]">
            <CardContent className="px-5 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-6">
              <FormSection title="Business Information" first>
                <BusinessInfoSection idPrefix="desktop-" />
              </FormSection>

              <FormSection icon={Phone} title="Contact Information">
                <ContactInfoSection
                  idPrefix="desktop-"
                  phoneArray={phoneArray}
                  whatsappArray={whatsappArray}
                />
              </FormSection>

              {SHOW_ADDITIONAL_INFORMATION && (
                <FormSection
                  icon={FileText}
                  title="Additional Information"
                  optional
                >
                  <AdditionalInfoSection idPrefix="desktop-" />
                </FormSection>
              )}

              <FormSection icon={UsersRound} title="Follow-up Settings">
                <FollowUpSection idPrefix="desktop-" />
              </FormSection>

              <div className="mt-6 flex flex-col-reverse gap-4 border-t border-[#edf2f5] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <OutlinedButton
                  type="button"
                  size="lg"
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </OutlinedButton>

                <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center">
                  <Controller
                    control={control}
                    name="addAnother"
                    render={({ field }) => (
                      <Label className="justify-center gap-2 text-[#547080] sm:justify-start">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                        Add another business
                      </Label>
                    )}
                  />

                  <SecondaryButton
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Save className="size-4" />
                    Save Business
                  </SecondaryButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Mobile: step-by-step wizard so the form doesn't feel massive on small screens
          <div>
            <div className="mb-6">
              <div className="flex items-center">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isActive = index === currentStep;
                  return (
                    <div
                      key={step.key}
                      className="flex flex-1 items-center last:flex-none"
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                          isCompleted &&
                            "border-[#08765d] bg-[#08765d] text-white",
                          isActive && "border-[#08765d] text-[#08765d]",
                          !isActive &&
                            !isCompleted &&
                            "border-[#dce8ee] text-[#8a9eaa]",
                        )}
                      >
                        {isCompleted ? <Check className="size-4" /> : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                            isCompleted ? "bg-[#08765d]" : "bg-[#dce8ee]",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-semibold text-[#163b58]">
                Step {currentStep + 1} of {steps.length} —{" "}
                {steps[currentStep].title}
              </p>
            </div>

            <Card className="border-[#dce8ee]">
              <CardContent className="p-5 sm:p-6">
                {steps[currentStep].render("mobile-")}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf2f5] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <OutlinedButton
                    type="button"
                    onClick={currentStep === 0 ? handleCancel : goBack}
                    className="w-full sm:w-auto"
                  >
                    {currentStep === 0 ? "Cancel" : "Back"}
                  </OutlinedButton>

                  {isLastStep ? (
                    <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
                      <Controller
                        control={control}
                        name="addAnother"
                        render={({ field }) => (
                          <Label className="justify-center gap-2 text-[#547080] sm:justify-start">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                              }
                            />
                            Add another business
                          </Label>
                        )}
                      />
                      <SecondaryButton
                        type="submit"
                        className="w-full sm:w-auto"
                      >
                        <Save className="size-4" />
                        Save Business
                      </SecondaryButton>
                    </div>
                  ) : (
                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      {stepAttempted && (
                        <p className="text-xs text-red-500">
                          Fill in all required fields to continue.
                        </p>
                      )}
                      <SecondaryButton
                        type="button"
                        onClick={goNext}
                        className="w-full sm:w-auto"
                      >
                        Next
                        <ArrowRight className="size-4" />
                      </SecondaryButton>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
