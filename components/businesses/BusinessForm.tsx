"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  type FieldErrors,
} from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Check,
  FileText,
  Loader2,
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
import {
  getBusinessRaw,
  useUpdateBusinessMutation,
  useCreateBusinessMutation,
} from "@/hooks/use-businesses";

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

interface BusinessFormProps {
  businessId?: string;
}

export default function BusinessForm({ businessId }: BusinessFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();

  const targetId = businessId || searchParams.get("id") || undefined;
  const isEditMode = Boolean(targetId);

  const methods = useForm<BusinessFormValues>({
    defaultValues: defaultBusinessFormValues,
    mode: "onChange",
    shouldUnregister: false,
  });
  const { control, handleSubmit, trigger, getValues, reset } = methods;

  const [currentStep, setCurrentStep] = useState(0);
  const [stepAttempted, setStepAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMutation = useUpdateBusinessMutation();
  const createMutation = useCreateBusinessMutation();

  const phoneArray = useFieldArray({ control, name: "phoneNumbers" });
  const whatsappArray = useFieldArray({ control, name: "whatsappNumbers" });

  useEffect(() => {
    if (!targetId) {
      setIsLoadingBusiness(false);
      return;
    }

    let isMounted = true;
    setIsLoadingBusiness(true);
    setLoadError(null);

    getBusinessRaw(targetId)
      .then((data) => {
        if (!isMounted) return;
        if (!data || !data._id) {
          setLoadError(`Business with ID #${targetId} not found.`);
          setIsLoadingBusiness(false);
          return;
        }

        const phoneNumbers =
          data.phoneNumbers && data.phoneNumbers.length > 0
            ? data.phoneNumbers.map((p) => ({ value: p.number || "" }))
            : [{ value: "" }];

        const whatsappNumbers =
          data.whatsappNumbers && data.whatsappNumbers.length > 0
            ? data.whatsappNumbers.map((w) => ({ value: w.number || "" }))
            : [{ value: "" }];

        reset({
          businessName: data.name || "",
          category: (data.categoryId ?? data.category) || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          address: data.address || "",
          status: data.status || (data.isActive === false ? "Inactive" : "Active"),
          businessType: data.businessType || "",
          phoneNumbers,
          whatsappNumbers,
          email: data.email || "",
          website: data.website || "",
          description: data.description || "",
          notes: data.notes || "",
          leadSource: data.leadSource || "",
          assignTo: data.assignedTo || "",
          nextFollowupDate: data.nextFollowupDate ? data.nextFollowupDate.slice(0, 10) : "",
          reminder: data.reminder || "",
          addAnother: false,
        });

        setIsLoadingBusiness(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setLoadError(
          `Unable to load business details: ${
            err instanceof Error ? err.message : "Not found"
          }`,
        );
        setIsLoadingBusiness(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetId, reset]);

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

  const onValid = async (values: BusinessFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      name: values.businessName.trim(),
      businessType: values.businessType || undefined,
      status: values.status || "Active",
      email: values.email.trim() || undefined,
      website: values.website.trim() || undefined,
      address: values.address.trim() || undefined,
      city: values.city.trim() || undefined,
      state: values.state.trim() || undefined,
      pincode: values.pincode.trim() || undefined,
      leadSource: values.leadSource || undefined,
      assignedTo: values.assignTo || undefined,
      description: values.description || undefined,
      notes: values.notes || undefined,
      nextFollowupDate: values.nextFollowupDate || undefined,
      reminder: values.reminder || undefined,
      phoneNumbers: values.phoneNumbers
        .filter((p) => p.value.trim())
        .map((p, idx) => ({ number: p.value.trim(), isPrimary: idx === 0 })),
      whatsappNumbers: values.whatsappNumbers
        .filter((w) => w.value.trim())
        .map((w, idx) => ({ number: w.value.trim(), isPrimary: idx === 0 })),
    };

    if (values.category) {
      payload.category = values.category;
      payload.categoryId = values.category;
    }

    try {
      if (isEditMode && targetId) {
        await updateMutation.mutateAsync({ id: targetId, payload });
        router.push(`/businesses/${targetId}`);
      } else {
        await createMutation.mutateAsync(payload);
        if (values.addAnother) {
          reset(defaultBusinessFormValues);
          setCurrentStep(0);
        } else {
          router.push("/businesses");
        }
      }
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save business. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
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

  if (isLoadingBusiness) {
    return (
      <Card className="border-[#dce8ee] p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#2563eb]" />
          <p className="text-sm font-medium text-[#64748b]">
            Loading business details...
          </p>
        </div>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="border-red-200 bg-red-50/50 p-8 text-center max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">Business Not Found</h3>
          <p className="text-sm text-[#64748b]">{loadError}</p>
          <OutlinedButton
            type="button"
            onClick={() => router.push("/businesses")}
            className="mt-3 gap-2"
          >
            <ArrowLeft className="size-4" /> Back to Businesses
          </OutlinedButton>
        </div>
      </Card>
    );
  }

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
                  {!isEditMode && (
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
                  )}

                  <SecondaryButton
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {isSubmitting
                      ? isEditMode
                        ? "Updating..."
                        : "Saving..."
                      : isEditMode
                        ? "Save Changes"
                        : "Save Business"}
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
                      {!isEditMode && (
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
                      )}
                      <SecondaryButton
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        {isSubmitting
                          ? isEditMode
                            ? "Updating..."
                            : "Saving..."
                          : isEditMode
                            ? "Save Changes"
                            : "Save Business"}
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
