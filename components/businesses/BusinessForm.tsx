"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
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
  RotateCcw,
  Save,
  UsersRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import OutlinedButton from "@/components/common/OutlinedButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import SaveButton from "@/components/common/SaveButton";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";

import FormSection from "@/components/businesses/FormSection";
import BusinessInfoSection from "@/components/businesses/sections/BusinessInfoSection";
import ContactInfoSection from "@/components/businesses/sections/ContactInfoSection";
import AdditionalInfoSection from "@/components/businesses/sections/AdditionalInfoSection";
import FollowUpSection from "@/components/businesses/sections/FollowUpSection";
import BusinessDetailsFollowups from "@/components/business-details/BusinessDetailsFollowups";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/lib/use-is-desktop";
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from "@/hooks/use-businesses";
import { getBusinessRaw } from "@/lib/business/api";
import {
  defaultBusinessFormValues,
  toFollowUpPayload,
  type BusinessFormValues,
} from "@/lib/business/form-types";
import { normalizeHttpUrl } from "@/lib/business/url-validation";

// Additional Information is built out but hidden from view for now - the
// team plans to start using it in a future release. Flip this to `true`
// when it's ready to go live; the mobile stepper below picks up the extra
// step automatically, no other changes needed.
const SHOW_ADDITIONAL_INFORMATION = true;
const MAX_FORM_STEP_INDEX = SHOW_ADDITIONAL_INFORMATION ? 3 : 2;

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
  email: "Email",
  website: "Website",
  locationUrl: "Location URL",
  followUpType: "Follow-up Type",
  assignTo: "Assignee",
  nextFollowupDate: "Next Follow-up Date",
  phoneNumbers: "Phone Number",
  whatsappNumbers: "WhatsApp Number",
};

const describeErrors = (errors: FieldErrors<BusinessFormValues>): string[] =>
  (Object.keys(FIELD_LABELS) as (keyof BusinessFormValues)[])
    .filter((key) => Boolean(errors[key]))
    .map((key) => FIELD_LABELS[key] as string);

// These mirror each field's actual validation rules (see BusinessInfoSection
// / ContactInfoSection), but computed live off watched values so the
// Save/Next buttons can be disabled proactively - before the person has
// tried to submit - rather than only rejecting a click after the fact.
const isBusinessInfoComplete = (values: BusinessFormValues) =>
  Boolean(values.businessName?.trim()) &&
  Boolean(values.category) &&
  Boolean(values.city) &&
  Boolean(values.state?.trim()) &&
  /^\d{6}$/.test(values.pincode ?? "") &&
  Boolean(values.address?.trim()) &&
  Boolean(values.status);

const isContactInfoComplete = (values: BusinessFormValues) =>
  isNumberListComplete(values.phoneNumbers) &&
  isNumberListComplete(values.whatsappNumbers);

const isNumberListComplete = (numbers: BusinessFormValues["phoneNumbers"]) =>
  numbers.some((number) => /^\d{10}$/.test(number.value.trim())) &&
  numbers.every(
    (number) => !number.value.trim() || /^\d{10}$/.test(number.value.trim()),
  );

interface BusinessFormDraft {
  values: BusinessFormValues;
  currentStep: number;
}

function isBusinessFormValues(value: unknown): value is BusinessFormValues {
  if (!value || typeof value !== "object") return false;
  const values = value as Record<string, unknown>;
  const stringFields = [
    "businessName",
    "category",
    "city",
    "state",
    "pincode",
    "address",
    "status",
    "locationUrl",
    "email",
    "website",
    "description",
    "followUpType",
    "assignTo",
    "nextFollowupDate",
    "reminder",
  ];

  return (
    stringFields.every((field) => typeof values[field] === "string") &&
    (values.categoryName === undefined ||
      typeof values.categoryName === "string") &&
    (values.assignToName === undefined ||
      typeof values.assignToName === "string") &&
    typeof values.addAnother === "boolean" &&
    ["phoneNumbers", "whatsappNumbers"].every(
      (field) =>
        Array.isArray(values[field]) &&
        (values[field] as unknown[]).every(
          (entry) =>
            Boolean(entry) &&
            typeof entry === "object" &&
            typeof (entry as Record<string, unknown>).value === "string",
        ),
    )
  );
}

function readBusinessFormDraft(key: string): BusinessFormDraft | undefined {
  try {
    const serialized = window.localStorage.getItem(key);
    if (!serialized) return undefined;

    const draft: unknown = JSON.parse(serialized);
    const currentStep =
      draft && typeof draft === "object"
        ? (draft as Record<string, unknown>).currentStep
        : undefined;
    if (
      !draft ||
      typeof draft !== "object" ||
      !isBusinessFormValues((draft as Record<string, unknown>).values) ||
      typeof currentStep !== "number" ||
      !Number.isInteger(currentStep)
    ) {
      console.error("Ignoring invalid saved business form draft.");
      window.localStorage.removeItem(key);
      return undefined;
    }

    return draft as BusinessFormDraft;
  } catch (error: unknown) {
    console.error("Unable to restore saved business form draft:", error);
    return undefined;
  }
}

function clearBusinessFormDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch (error: unknown) {
    console.error("Unable to clear saved business form draft:", error);
  }
}

function hasBusinessFormChanged(
  values: BusinessFormValues,
  baseline: BusinessFormValues,
) {
  const normalize = (formValues: BusinessFormValues) => ({
    addAnother: formValues.addAnother,
    businessName: formValues.businessName,
    category: formValues.category,
    categoryName: formValues.categoryName ?? "",
    city: formValues.city,
    state: formValues.state,
    pincode: formValues.pincode,
    address: formValues.address,
    status: formValues.status,
    locationUrl: formValues.locationUrl,
    phoneNumbers: formValues.phoneNumbers.map(({ value }) => value),
    whatsappNumbers: formValues.whatsappNumbers.map(({ value }) => value),
    email: formValues.email,
    website: formValues.website,
    description: formValues.description,
    followUpType: formValues.followUpType,
    assignTo: formValues.assignTo,
    assignToName: formValues.assignToName ?? "",
    nextFollowupDate: formValues.nextFollowupDate,
    reminder: formValues.reminder,
  });

  return JSON.stringify(normalize(values)) !== JSON.stringify(normalize(baseline));
}

export default function BusinessForm({
  initialValues,
  businessId,
}: {
  /** Pass the fetched-and-transformed record here for edit mode; omit for
   * a fresh "Add Business" form. Whatever is passed in is what "Reset"
   * restores the form to. */
  initialValues?: BusinessFormValues;
  businessId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();

  const targetId = businessId || searchParams.get("id") || undefined;
  const isEditMode = Boolean(targetId);
  const draftKey = `hasvik-crm:business-form:${targetId ?? "new"}`;

  // Captured once on mount - this is the snapshot Reset restores to,
  // independent of anything the person types afterward.
  const [initialSnapshot] = useState<BusinessFormValues>(
    () => initialValues ?? defaultBusinessFormValues,
  );
  const [draftBaseline, setDraftBaseline] =
    useState<BusinessFormValues>(initialSnapshot);

  const methods = useForm<BusinessFormValues>({
    defaultValues: initialSnapshot,
    mode: "onChange",
    shouldUnregister: false,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(isEditMode);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMutation = useUpdateBusinessMutation();
  const createMutation = useCreateBusinessMutation();

  const phoneArray = useFieldArray({ control, name: "phoneNumbers" });
  const whatsappArray = useFieldArray({ control, name: "whatsappNumbers" });

  // In edit mode this holds the values loaded from the API, so "Reset"
  // can restore them instead of clearing the form.
  const savedValuesRef = useRef<BusinessFormValues | null>(null);
  const historyGuardRef = useRef<{
    state: Record<string, unknown>;
    url: string;
    historyLength: number;
  } | null>(null);
  const allowNextPopRef = useRef(false);
  const pendingNavigationRef = useRef<
    { type: "route"; href: string } | { type: "browser-back" } | null
  >(null);
  const watchedValues = useWatch({ control }) as BusinessFormValues;
  const hasUnsavedChanges =
    isDraftReady &&
    hasBusinessFormChanged(watchedValues, draftBaseline);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);
  const isFormComplete =
    isBusinessInfoComplete(watchedValues) &&
    isContactInfoComplete(watchedValues);

  useEffect(() => {
    if (targetId) return;

    const draft = readBusinessFormDraft(draftKey);
    if (draft) {
      reset(draft.values);
      // Hydrate the form from browser storage after the client mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(
        Math.max(0, Math.min(draft.currentStep, MAX_FORM_STEP_INDEX)),
      );
    }
    setIsDraftReady(true);
  }, [draftKey, reset, targetId]);

  useEffect(() => {
    const serializedDraft = JSON.stringify({
      values: watchedValues,
      currentStep,
    });
    if (!isDraftReady || isSubmitting) return;
    if (
      currentStep === 0 &&
      !hasBusinessFormChanged(watchedValues, draftBaseline)
    ) {
      return;
    }

    try {
      window.localStorage.setItem(draftKey, serializedDraft);
    } catch (error: unknown) {
      console.error("Unable to save business form draft:", error);
    }
  }, [
    currentStep,
    draftBaseline,
    draftKey,
    isDraftReady,
    isSubmitting,
    watchedValues,
  ]);

  useEffect(() => {
    if (!targetId) {
      return;
    }

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

        // The API may return `category` as an object ({ _id, name }) or
        // as a plain id string, so handle both.
        const rawCategory = data.category as unknown;
        const categoryObj =
          typeof rawCategory === "object" && rawCategory !== null
            ? (rawCategory as { _id?: string; name?: string })
            : null;
        const categoryId =
          data.categoryId ??
          categoryObj?._id ??
          (typeof rawCategory === "string" ? rawCategory : "");

        const loadedValues: BusinessFormValues = {
          businessName: data.name || "",
          category: categoryId || "",
          categoryName: categoryObj?.name || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          address: data.address || "",
          status:
            data.status || (data.isActive === false ? "Inactive" : "Active"),
          locationUrl: data.location?.url || "",
          phoneNumbers,
          whatsappNumbers,
          email: data.email || "",
          website: data.website || "",
          description: data.description || "",
          followUpType: data.followUp?.type || "",
          assignTo: data.followUp?.assignedTo || data.assignedTo || "",
          assignToName: "",
          nextFollowupDate: data.followUp?.scheduledAt || data.nextFollowupDate
            ? (data.followUp?.scheduledAt || data.nextFollowupDate || "").slice(
                0,
                10,
              )
            : "",
          reminder:
            data.followUp?.reminderInMinutes === undefined &&
            (data.reminder === undefined || data.reminder === null)
              ? ""
              : String(
                  data.followUp?.reminderInMinutes ?? data.reminder,
                ),
          addAnother: false,
        };

        savedValuesRef.current = loadedValues;
        setDraftBaseline(loadedValues);
        const draft = readBusinessFormDraft(draftKey);
        reset(loadedValues);
        if (draft) {
          reset(draft.values, { keepDefaultValues: true });
        }
        if (draft) {
          setCurrentStep(
            Math.max(0, Math.min(draft.currentStep, MAX_FORM_STEP_INDEX)),
          );
        }
        setIsDraftReady(true);

        setIsLoadingBusiness(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setLoadError(
          `Unable to load business details: ${
            err instanceof Error ? err.message : "Not found"
          }`,
        );
        setIsDraftReady(true);
        setIsLoadingBusiness(false);
      });

    return () => {
      isMounted = false;
    };
  }, [draftKey, targetId, reset]);

  const requestNavigation = (href: string) => {
    if (hasUnsavedChangesRef.current) {
      pendingNavigationRef.current = { type: "route", href };
      setIsDiscardDialogOpen(true);
      return;
    }
    router.replace(href);
  };

  const handleBackToBusinesses = () => requestNavigation("/businesses");

  useEffect(() => {
    if (!isDraftReady) return;

    let guard = historyGuardRef.current;
    if (!guard || guard.url !== window.location.href) {
      guard = {
        state: {
          ...(window.history.state &&
          typeof window.history.state === "object"
            ? window.history.state
            : {}),
          businessFormHistoryGuard: true,
        },
        url: window.location.href,
        historyLength: window.history.length,
      };
      historyGuardRef.current = guard;
      window.history.pushState(guard.state, "", guard.url);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (allowNextPopRef.current) {
        allowNextPopRef.current = false;
        return;
      }
      if (!hasUnsavedChangesRef.current) {
        event.stopImmediatePropagation();
        allowNextPopRef.current = true;
        window.history.back();
        return;
      }

      event.stopImmediatePropagation();
      const activeGuard = historyGuardRef.current;
      if (activeGuard) {
        window.history.pushState(activeGuard.state, "", activeGuard.url);
      }
      pendingNavigationRef.current = { type: "browser-back" };
      setIsDiscardDialogOpen(true);
    };

    window.addEventListener("popstate", handlePopState, true);

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        !hasUnsavedChangesRef.current
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search &&
          destination.hash === window.location.hash)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      pendingNavigationRef.current = {
        type: "route",
        href: `${destination.pathname}${destination.search}${destination.hash}`,
      };
      setIsDiscardDialogOpen(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isDraftReady]);

  const cancelDiscardChanges = () => {
    pendingNavigationRef.current = null;
    setIsDiscardDialogOpen(false);
  };

  const discardChangesAndLeave = () => {
    const pendingNavigation = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    setIsDiscardDialogOpen(false);
    clearBusinessFormDraft(draftKey);
    reset(savedValuesRef.current ?? initialSnapshot);
    setSubmitError(null);
    setCurrentStep(0);

    if (pendingNavigation?.type === "browser-back") {
      allowNextPopRef.current = true;
      const guard = historyGuardRef.current;
      if (guard && guard.historyLength > 1) {
        window.history.go(-2);
      } else {
        router.replace("/businesses");
      }
      return;
    }

    if (pendingNavigation?.type === "route") {
      router.replace(pendingNavigation.href);
    }
  };

  const handleReset = () => {
    // Edit mode -> back to the saved values; add mode -> empty form.
    clearBusinessFormDraft(draftKey);
    const valuesToReset = savedValuesRef.current ?? initialSnapshot;
    reset(valuesToReset);
    setSubmitError(null);
    setCurrentStep(0);
  };

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
      title: "Follow-up",
      render: (idPrefix: string) => (
        <>
          {!isEditMode && <FollowUpSection idPrefix={idPrefix} />}
          {isEditMode && targetId && (
            <div className="mt-6">
              <BusinessDetailsFollowups businessId={targetId} />
            </div>
          )}
        </>
      ),
    },
  ];

  const isLastStep = currentStep === steps.length - 1;

  const isCurrentStepComplete = (() => {
    const key = steps[currentStep].key;
    if (key === "business") return isBusinessInfoComplete(watchedValues);
    if (key === "contact") return isContactInfoComplete(watchedValues);
    return true;
  })();

  const isStepAccessible = (stepIndex: number) =>
    steps.slice(0, stepIndex).every((step) => {
      if (step.key === "business") return isBusinessInfoComplete(watchedValues);
      if (step.key === "contact") return isContactInfoComplete(watchedValues);
      return true;
    });

  const goNext = () => {
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const onValid = async (values: BusinessFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      name: values.businessName.trim(),
      status: values.status || "Active",
      email: isEditMode
        ? values.email.trim() || null
        : values.email.trim() || undefined,
      website: isEditMode
        ? normalizeHttpUrl(values.website) || null
        : normalizeHttpUrl(values.website) || undefined,
      address: values.address.trim() || undefined,
      city: values.city.trim() || undefined,
      state: values.state.trim() || undefined,
      pincode: values.pincode.trim() || undefined,
      description: isEditMode
        ? values.description
        : values.description || undefined,
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

    if (values.locationUrl.trim() || isEditMode) {
      payload.location = { url: normalizeHttpUrl(values.locationUrl) };
    }

    if (!isEditMode) {
      payload.assignedTo = values.assignTo;
      payload.followUp = toFollowUpPayload(values);
    }

    try {
      if (isEditMode && targetId) {
        await updateMutation.mutateAsync({ id: targetId, payload });
        setDraftBaseline(values);
        clearBusinessFormDraft(draftKey);
        router.replace(`/businesses/${targetId}`);
      } else {
        await createMutation.mutateAsync(payload);
        // Stay on the form so the next business can be added right away.
        // (The success toast is shown by useCreateBusinessMutation.)
        clearBusinessFormDraft(draftKey);
        reset(defaultBusinessFormValues);
        setCurrentStep(0);
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
          <Loader2 className="size-8 animate-spin text-primary" />
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
          <h3 className="text-base font-bold text-[#0f172a]">
            Business Not Found
          </h3>
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
        className="flex flex-col gap-5"
      >
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {isDesktop || isEditMode ? (
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="px-4 py-5 sm:px-7 sm:py-6 lg:px-8">
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

              {!isEditMode && (
                <FormSection icon={UsersRound} title="Follow-up">
                  <FollowUpSection idPrefix="desktop-" />
                </FormSection>
              )}

              {!isEditMode && (
                <div className="mt-6 flex flex-col-reverse gap-4 border-t border-[#edf2f5] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <OutlinedButton
                    type="button"
                    size="lg"
                    onClick={handleBackToBusinesses}
                    className="w-full sm:w-auto"
                  >
                    Back to Business
                  </OutlinedButton>

                  <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
                    <OutlinedButton
                      type="button"
                      size="lg"
                      onClick={handleReset}
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="size-4" />
                      Reset
                    </OutlinedButton>

                    <SaveButton
                      type="submit"
                      size="lg"
                      disabled={
                        !isFormComplete || (isEditMode && !isDirty) || isSubmitting
                      }
                      className="w-full sm:w-auto"
                    >
                      <Save className="size-4" />
                      {isSubmitting ? "Saving..." : "Save Business"}
                    </SaveButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Mobile add flow stays step-based; edit mode uses the full form layout above.
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
                      <button
                        type="button"
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`Go to ${step.title}`}
                        disabled={!isStepAccessible(index)}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
                          isCompleted &&
                            "border-brand-green bg-brand-green text-secondary-foreground",
                          isActive && "border-brand-green text-brand-green-strong",
                          !isActive &&
                            !isCompleted &&
                            "border-[#dce8ee] text-[#8a9eaa] disabled:opacity-50",
                        )}
                      >
                        {isCompleted ? <Check className="size-4" /> : index + 1}
                      </button>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                            isCompleted ? "bg-brand-green" : "bg-[#dce8ee]",
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
                    onClick={
                      currentStep === 0 ? handleBackToBusinesses : goBack
                    }
                    className="w-full sm:w-auto"
                  >
                    {currentStep === 0 ? "Back to Business" : "Back"}
                  </OutlinedButton>

                  {isLastStep ? (
                    <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
                      <OutlinedButton
                        type="button"
                        onClick={handleReset}
                        className="w-full sm:w-auto"
                      >
                        <RotateCcw className="size-4" />
                        Reset
                      </OutlinedButton>
                      <SaveButton
                        type="submit"
                        disabled={
                          !isFormComplete ||
                          (isEditMode && !isDirty) ||
                          isSubmitting
                        }
                        className="w-full sm:w-auto"
                      >
                        <Save className="size-4" />
                        {isSubmitting ? "Saving..." : "Save Business"}
                      </SaveButton>
                    </div>
                  ) : (
                    <div className="flex flex-col items-stretch gap-2 sm:items-end">
                      {!isCurrentStepComplete && (
                        <p className="text-xs text-[#8a9eaa]">
                          Fill in all required fields to continue.
                        </p>
                      )}
                      <SecondaryButton
                        type="button"
                        onClick={goNext}
                        disabled={!isCurrentStepComplete}
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

        {isEditMode && targetId && (
          <>
            <BusinessDetailsFollowups businessId={targetId} />
            <div className="flex flex-col-reverse gap-4 border-t border-[#edf2f5] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <OutlinedButton
                type="button"
                size="lg"
                onClick={handleBackToBusinesses}
                className="w-full sm:w-auto"
              >
                Back to Business
              </OutlinedButton>
              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
                <OutlinedButton
                  type="button"
                  size="lg"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </OutlinedButton>
                <SaveButton
                  type="submit"
                  size="lg"
                  disabled={
                    !isFormComplete || (isEditMode && !isDirty) || isSubmitting
                  }
                  className="w-full sm:w-auto"
                >
                  <Save className="size-4" />
                  {isSubmitting ? "Saving..." : "Save Business"}
                </SaveButton>
              </div>
            </div>
          </>
        )}
      </form>
      <ManagementConfirmDialog
        open={isDiscardDialogOpen}
        title="Discard changes?"
        description="You have unsaved changes to this business. If you leave now, those changes will be discarded."
        confirmLabel="Discard changes"
        onCancel={cancelDiscardChanges}
        onConfirm={discardChangesAndLeave}
      />
    </FormProvider>
  );
}
