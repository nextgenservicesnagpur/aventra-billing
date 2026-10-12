import { Search } from "lucide-react";
import { Input } from "@/shared/components/form/Input";

/**
 * Global search shell for the dashboard header. Keyboard accessible and
 * visually quiet; it intentionally owns no results or modal — search
 * behavior arrives with the feature that needs it. The hint communicates
 * the intended shortcut without faking a command palette.
 */
export const DashboardSearch = () => (
  <div role="search" className="flex w-full justify-center">
    <div className="w-full max-w-sm">
      <label htmlFor="dashboard-search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <Input
          id="dashboard-search"
          type="search"
          placeholder="Search…"
          startIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          className="h-9 rounded-md pr-12 text-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-sans text-[11px] font-medium text-text-muted"
        >
          ⌘K
        </kbd>
      </div>
    </div>
  </div>
);
