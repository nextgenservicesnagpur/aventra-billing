import { Bell } from "lucide-react";

/**
 * Notification control. A quiet, accessible icon button with stable
 * dimensions; it carries no badge because no notification data exists
 * yet. A future notification panel plugs in here without changing the
 * header layout.
 */
export const NotificationButton = () => (
  <button
    type="button"
    aria-label="Notifications"
    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
  >
    <Bell aria-hidden="true" className="h-4 w-4" />
  </button>
);
