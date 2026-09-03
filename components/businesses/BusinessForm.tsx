"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  FileText,
  Phone,
  Save,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import FormSection from "@/components/businesses/FormSection";
import BusinessInfoSection from "@/components/businesses/sections/BusinessInfoSection";
import ContactInfoSection from "@/components/businesses/sections/ContactInfoSection";
import AdditionalInfoSection from "@/components/businesses/sections/AdditionalInfoSection";
import FollowUpSection from "@/components/businesses/sections/FollowUpSection";
import { cn } from "@/lib/utils";
import {
  initialBusinessFormState,
  type BusinessFormState,
} from "@/lib/business-form-types";
import { createBusiness } from "@/lib/business-store";

// Additional Information is built out but hidden from view for now - the
// team plans to start using it in a future release. Flip this to `true`
// when it's ready to go live; the mobile stepper below picks up the extra
// step automatically, no other changes needed.
const SHOW_ADDITIONAL_INFORMATION = false;

export default function BusinessForm() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessFormState>(initialBusinessFormState);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof BusinessFormState>(
    key: K,
    value: BusinessFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // When "Same as phone" is checked, WhatsApp Numbers mirrors as many phone
  // numbers as there are WhatsApp rows currently on screen - not more. So by
  // default (1 WhatsApp row) only the first phone number gets copied; if the
  // person clicks "+ Add WhatsApp Number" to grow that to 2 rows, the sync
  // then fills both rows from the first two phone numbers.
  const buildSyncedWhatsapp = (phones: string[], rowCount: number): string[] =>
    Array.from({ length: rowCount }, (_, i) => phones[i] ?? "");

  const handlePhoneNumbersChange = (values: string[]) => {
    setForm((prev) => ({
      ...prev,
      phoneNumbers: values,
      whatsappNumbers: prev.sameAsPhone
        ? buildSyncedWhatsapp(values, prev.whatsappNumbers.length)
        : prev.whatsappNumbers,
    }));
  };

  const handleWhatsappNumbersChange = (values: string[]) => {
    setForm((prev) => ({
      ...prev,
      // While synced, adding/removing a WhatsApp row re-derives every row's
      // value from the phone numbers rather than trusting the raw edit,
      // since typing is disabled on synced rows anyway.
      whatsappNumbers: prev.sameAsPhone
        ? buildSyncedWhatsapp(prev.phoneNumbers, values.length)
        : values,
    }));
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      sameAsPhone: checked,
      whatsappNumbers: checked
        ? buildSyncedWhatsapp(prev.phoneNumbers, prev.whatsappNumbers.length)
        : prev.whatsappNumbers,
    }));
  };

  const handleCancel = () => router.push("/businesses");

  const getStepValidation = (
    stepKey: string,
  ): { isValid: boolean; missingFields: string[] } => {
    const missing: string[] = [];

    if (stepKey === "business") {
      if (!form.businessName.trim()) missing.push("Business Name");
      if (!form.category) missing.push("Category");
      if (!form.city) missing.push("City");
      if (!form.address.trim()) missing.push("Address");
      if (!form.status) missing.push("Status");
    }

    if (stepKey === "contact") {
      if (!form.phoneNumbers.some((n) => n.trim().length > 0)) {
        missing.push("Phone Number");
      }
      if (!form.whatsappNumbers.some((n) => n.trim().length > 0)) {
        missing.push("WhatsApp Number");
      }
    }

    return { isValid: missing.length === 0, missingFields: missing };
  };

  const validateAllRequiredFields = (): {
    isValid: boolean;
    missingFields: string[];
  } => {
    const business = getStepValidation("business");
    const contact = getStepValidation("contact");
    return {
      isValid: business.isValid && contact.isValid,
      missingFields: [...business.missingFields, ...contact.missingFields],
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const { isValid, missingFields } = validateAllRequiredFields();
    if (!isValid) {
      setSubmitError(
        `Please fill in the required fields: ${missingFields.join(", ")}`,
      );
      return;
    }
    setSubmitError(null);

    const newBiz = createBusiness({
      name: form.businessName.trim(),
      phone: form.phoneNumbers.find((n) => n.trim().length > 0) || "9876543210",
      category: form.category || "Furniture Shop",
      city: form.city || "Ballia",
      status: (form.status === "Inactive" ? "Inactive" : "Active"),
      address: form.address?.trim() || undefined,
      email: form.email?.trim() || undefined,
      website: form.website?.trim() || undefined,
      businessType: form.businessType || undefined,
      leadSource: form.leadSource || undefined,
      assignedTo: form.assignTo || undefined,
    });

    if (form.addAnother) {
      setForm({ ...initialBusinessFormState });
      setCurrentStep(0);
    } else {
      router.push(`/businesses/${newBiz.id}`);
    }
  };

  const steps = [
    {
      key: "business",
      title: "Business Information",
      render: (idPrefix: string) => (
        <BusinessInfoSection form={form} update={update} idPrefix={idPrefix} />
      ),
    },
    {
      key: "contact",
      title: "Contact Information",
      render: (idPrefix: string) => (
        <ContactInfoSection
          form={form}
          update={update}
          onPhoneNumbersChange={handlePhoneNumbersChange}
          onWhatsappNumbersChange={handleWhatsappNumbersChange}
          onSameAsPhoneToggle={handleSameAsPhoneToggle}
          idPrefix={idPrefix}
        />
      ),
    },
    ...(SHOW_ADDITIONAL_INFORMATION
      ? [
          {
            key: "additional",
            title: "Additional Information",
            render: (idPrefix: string) => (
              <AdditionalInfoSection
                form={form}
                update={update}
                idPrefix={idPrefix}
              />
            ),
          },
        ]
      : []),
    {
      key: "followup",
      title: "Follow-up Settings",
      render: (idPrefix: string) => (
        <FollowUpSection form={form} update={update} idPrefix={idPrefix} />
      ),
    },
  ];

  const isLastStep = currentStep === steps.length - 1;
  const currentStepValidation = getStepValidation(steps[currentStep].key);

  const goNext = () => {
    if (!currentStepValidation.isValid) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep((step) => Math.max(step - 1, 0));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Desktop / tablet: every section shown at once on a single page */}
      <Card className="hidden border-[#dce8ee] lg:block">
        <CardContent className="px-5 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-3">
          <FormSection title="Business Information" first>
            <BusinessInfoSection
              form={form}
              update={update}
              idPrefix="desktop-"
            />
          </FormSection>

          <FormSection icon={Phone} title="Contact Information">
            <ContactInfoSection
              form={form}
              update={update}
              onPhoneNumbersChange={handlePhoneNumbersChange}
              onWhatsappNumbersChange={handleWhatsappNumbersChange}
              onSameAsPhoneToggle={handleSameAsPhoneToggle}
              idPrefix="desktop-"
            />
          </FormSection>

          {SHOW_ADDITIONAL_INFORMATION && (
            <FormSection
              icon={FileText}
              title="Additional Information"
              optional
            >
              <AdditionalInfoSection
                form={form}
                update={update}
                idPrefix="desktop-"
              />
            </FormSection>
          )}

          <FormSection icon={UsersRound} title="Follow-up Settings">
            <FollowUpSection form={form} update={update} idPrefix="desktop-" />
          </FormSection>

          <div className="mt-6 flex flex-col-reverse gap-4 border-t border-[#edf2f5] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="w-full border-[#dce8ee] text-[#547080] sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center">
              <Label className="justify-center gap-2 text-[#547080] sm:justify-start">
                <Checkbox
                  checked={form.addAnother}
                  onCheckedChange={(checked) =>
                    update("addAnother", checked === true)
                  }
                />
                Add another business
              </Label>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#08765d] text-white hover:bg-[#066a53] sm:w-auto"
              >
                <Save className="size-4" />
                Save Business
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: step-by-step wizard so the form doesn't feel massive on small screens */}
      <div className="lg:hidden">
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
                      isCompleted && "border-[#08765d] bg-[#08765d] text-white",
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
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 0 ? handleCancel : goBack}
                className="w-full border-[#dce8ee] text-[#547080] sm:w-auto"
              >
                {currentStep === 0 ? "Cancel" : "Back"}
              </Button>

              {isLastStep ? (
                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
                  <Label className="justify-center gap-2 text-[#547080] sm:justify-start">
                    <Checkbox
                      checked={form.addAnother}
                      onCheckedChange={(checked) =>
                        update("addAnother", checked === true)
                      }
                    />
                    Add another business
                  </Label>
                  <Button
                    type="submit"
                    className="w-full bg-[#08765d] text-white hover:bg-[#066a53] sm:w-auto"
                  >
                    <Save className="size-4" />
                    Save Business
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  {!currentStepValidation.isValid && (
                    <p className="text-xs text-red-500">
                      Fill in all required fields to continue.
                    </p>
                  )}
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={!currentStepValidation.isValid}
                    className={cn(
                      "w-full sm:w-auto",
                      currentStepValidation.isValid
                        ? "bg-[#08765d] text-white hover:bg-[#066a53]"
                        : "cursor-not-allowed bg-[#c9d6db] text-white hover:bg-[#c9d6db]",
                    )}
                  >
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
