import { Settings2 } from "lucide-react";

export const BillingSettingsHeader = () => {
  return (
    <div className="flex flex-col gap-1 pb-6 border-b border-border/80">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-surface-alt text-primary-light shadow-xs"
          aria-hidden="true"
        >
          <Settings2 size={20} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Billing Settings
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
            Configure document numbering, default notes, and terms for your organization.
          </p>
        </div>
      </div>
    </div>
  );
};
