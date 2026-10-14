"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/shared/components/form/Button";
import type { CustomerDto, CreateCustomerInput } from "../../data/dto/customer-dto";
import type { CustomerType, GstTreatment, CustomerStatus, CustomerAddress } from "../../domain/entities/customer";
import { createCustomerAction } from "../../data/mutations/create-customer";
import { updateCustomerAction } from "../../data/mutations/update-customer";
import { derivePanFromGstin } from "../../domain/rules/customer-rules";
import { CustomerBasicInformationSection } from "./CustomerBasicInformationSection";
import { CustomerContactSection } from "./CustomerContactSection";
import { CustomerBillingAddressSection } from "./CustomerBillingAddressSection";
import { CustomerShippingAddressSection } from "./CustomerShippingAddressSection";
import { CustomerTaxSection } from "./CustomerTaxSection";
import { CustomerPaymentSettingsSection } from "./CustomerPaymentSettingsSection";
import { CustomerNotesSection } from "./CustomerNotesSection";

export type CustomerFormProps = {
  initialData?: CustomerDto | null;
  isEdit?: boolean;
};

const defaultAddress: CustomerAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Maharashtra",
  pinCode: "",
  country: "India",
};

export const CustomerForm = ({ initialData, isEdit = false }: CustomerFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [customerType, setCustomerType] = useState<CustomerType>(
    initialData?.customerType || "BUSINESS",
  );
  const [gstTreatment, setGstTreatment] = useState<GstTreatment>(
    initialData?.gstTreatment || "REGISTERED_BUSINESS_REGULAR",
  );
  const [status, setStatus] = useState<CustomerStatus>(
    initialData?.status || "ACTIVE",
  );

  // Contact Information
  const [contactPerson, setContactPerson] = useState(
    initialData?.contactPerson || "",
  );
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [alternatePhone, setAlternatePhone] = useState(
    initialData?.alternatePhone || "",
  );

  // Billing and Shipping Addresses
  const [billingAddress, setBillingAddress] = useState<CustomerAddress>(
    initialData?.billingAddress || defaultAddress,
  );
  const [shippingAddress, setShippingAddress] = useState<CustomerAddress>(
    initialData?.shippingAddress || defaultAddress,
  );
  const [sameAsBillingAddress, setSameAsBillingAddress] = useState(
    initialData?.sameAsBillingAddress ?? true,
  );

  // Tax and Compliance
  const [gstin, setGstin] = useState(initialData?.gstin || "");
  const [pan, setPan] = useState(initialData?.pan || "");
  const [currency, setCurrency] = useState(initialData?.currency || "INR (₹)");
  const [placeOfSupply, setPlaceOfSupply] = useState(
    initialData?.placeOfSupply || "27-Maharashtra",
  );

  // Additional Settings
  const [paymentTerms, setPaymentTerms] = useState(
    initialData?.paymentTerms || "Net 15 days",
  );
  const [creditLimit, setCreditLimit] = useState<number | null>(
    initialData?.creditLimit ?? 100000,
  );
  const [defaultDiscount, setDefaultDiscount] = useState<number | null>(
    initialData?.defaultDiscount ?? 0,
  );
  const [defaultTaxPreference, setDefaultTaxPreference] = useState(
    initialData?.defaultTaxPreference || "18% (IGST)",
  );
  const [priceList, setPriceList] = useState(
    initialData?.priceList || "Default Price List",
  );

  // Notes and Tags
  const [internalNotes, setInternalNotes] = useState(
    initialData?.internalNotes || "",
  );
  const [tags, setTags] = useState<string[]>(
    initialData?.tags || ["Priority"],
  );

  // Error feedback state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const clearFieldError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const buildPayload = (overrideStatus?: CustomerStatus): CreateCustomerInput => {
    return {
      name: name.trim(),
      customerType,
      gstTreatment,
      status: overrideStatus || status,
      contactPerson: contactPerson.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      alternatePhone: alternatePhone.trim() || null,
      billingAddress,
      shippingAddress: sameAsBillingAddress ? { ...billingAddress } : shippingAddress,
      sameAsBillingAddress,
      gstin: gstin.trim() || null,
      pan: pan.trim() || null,
      currency,
      placeOfSupply,
      paymentTerms,
      creditLimit,
      defaultDiscount,
      defaultTaxPreference,
      priceList,
      internalNotes: internalNotes.trim() || null,
      tags,
    };
  };

  const handleSubmit = (overrideStatus?: CustomerStatus) => {
    setServerError(null);
    setErrors({});

    const payload = buildPayload(overrideStatus);

    startTransition(async () => {
      try {
        if (isEdit && initialData?.id) {
          const res = await updateCustomerAction(initialData.id, payload);
          if (!res.success) {
            setServerError(res.error || "Failed to update customer.");
            if (res.fieldErrors) setErrors(res.fieldErrors);
            return;
          }
          router.push(`/customers/${initialData.id}?saved=1`);
        } else {
          const res = await createCustomerAction(payload);
          if (!res.success) {
            setServerError(res.error || "Failed to create customer.");
            if (res.fieldErrors) setErrors(res.fieldErrors);
            return;
          }
          router.push("/customers?saved=1");
        }
      } catch (err: unknown) {
        setServerError(
          err instanceof Error ? err.message : "An unexpected server error occurred.",
        );
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Global Server Error Banner */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {serverError}
        </div>
      )}

      {/* 1. Basic Information */}
      <CustomerBasicInformationSection
        name={name}
        onNameChange={(val: string) => {
          setName(val);
          clearFieldError("name");
        }}
        customerType={customerType}
        onCustomerTypeChange={(val: CustomerType) => setCustomerType(val)}
        gstTreatment={gstTreatment}
        onGstTreatmentChange={(val: GstTreatment) => setGstTreatment(val)}
        status={status}
        onStatusChange={(val: CustomerStatus) => setStatus(val)}
        error={errors["name"]}
      />

      {/* 2. Contact Information */}
      <CustomerContactSection
        contactPerson={contactPerson}
        onContactPersonChange={(val: string) => setContactPerson(val)}
        email={email}
        onEmailChange={(val: string) => {
          setEmail(val);
          clearFieldError("email");
        }}
        phone={phone}
        onPhoneChange={(val: string) => {
          setPhone(val);
          clearFieldError("phone");
        }}
        alternatePhone={alternatePhone}
        onAlternatePhoneChange={(val: string) => {
          setAlternatePhone(val);
          clearFieldError("alternatePhone");
        }}
        emailError={errors["email"]}
        phoneError={errors["phone"]}
        alternatePhoneError={errors["alternatePhone"]}
      />

      {/* 3. Billing Address */}
      <CustomerBillingAddressSection
        billingAddress={billingAddress}
        onBillingAddressChange={(updates: Partial<CustomerAddress>) =>
          setBillingAddress((prev) => ({ ...prev, ...updates }))
        }
        errors={errors}
      />

      {/* 4. Shipping Address */}
      <CustomerShippingAddressSection
        shippingAddress={shippingAddress}
        onShippingAddressChange={(updates: Partial<CustomerAddress>) =>
          setShippingAddress((prev) => ({ ...prev, ...updates }))
        }
        sameAsBillingAddress={sameAsBillingAddress}
        onSameAsBillingAddressChange={(val: boolean) => setSameAsBillingAddress(val)}
        errors={errors}
      />

      {/* 5. Tax & Compliance */}
      <CustomerTaxSection
        gstin={gstin}
        onGstinChange={(val: string) => {
          const cleaned = val.replace(/\s+/g, "").toUpperCase();
          setGstin(cleaned);
          clearFieldError("gstin");

          // Auto-extract PAN from GSTIN (characters 3-12)
          const autoPan = derivePanFromGstin(cleaned);
          if (autoPan) {
            setPan(autoPan);
            clearFieldError("pan");
          }
        }}
        pan={pan}
        onPanChange={(val: string) => {
          setPan(val.replace(/\s+/g, "").toUpperCase());
          clearFieldError("pan");
        }}
        currency={currency}
        onCurrencyChange={(val: string) => setCurrency(val)}
        placeOfSupply={placeOfSupply}
        onPlaceOfSupplyChange={(val: string) => setPlaceOfSupply(val)}
        gstTreatment={gstTreatment}
        gstinError={errors["gstin"]}
        panError={errors["pan"]}
      />

      {/* 6. Additional Settings */}
      <CustomerPaymentSettingsSection
        paymentTerms={paymentTerms}
        onPaymentTermsChange={(val: string) => setPaymentTerms(val)}
        creditLimit={creditLimit}
        onCreditLimitChange={(val: number | null) => setCreditLimit(val)}
        defaultDiscount={defaultDiscount}
        onDefaultDiscountChange={(val: number | null) => setDefaultDiscount(val)}
        defaultTaxPreference={defaultTaxPreference}
        onDefaultTaxPreferenceChange={(val: string) => setDefaultTaxPreference(val)}
        priceList={priceList}
        onPriceListChange={(val: string) => setPriceList(val)}
        creditLimitError={errors["creditLimit"]}
        defaultDiscountError={errors["defaultDiscount"]}
      />

      {/* 7. Notes & Tags */}
      <CustomerNotesSection
        internalNotes={internalNotes}
        onInternalNotesChange={(val: string) => setInternalNotes(val)}
        tags={tags}
        onTagsChange={(val: string[]) => setTags(val)}
      />

      {/* Bottom Action Buttons */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/customers"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-alt px-4 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          <X size={15} />
          <span>Cancel</span>
        </Link>

        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => handleSubmit("INACTIVE")}
          className="h-10 px-4 text-sm"
        >
          <Check size={15} />
          <span>Save as Draft</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="h-10 px-5 text-sm shadow-xs"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>{isEdit ? "Update Customer" : "Create Customer"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
