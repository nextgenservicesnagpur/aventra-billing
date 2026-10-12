/**
 * Dashboard loading state. Renders inside the dashboard shell's content
 * region while the segment loads: a quiet centered label with stable
 * spacing, so the header never jumps and no oversized skeleton appears.
 */
const DashboardLoading = () => (
  <div className="flex w-full items-center justify-center py-24 text-center text-foreground">
    <p className="text-sm text-text-muted">Loading dashboard…</p>
  </div>
);

export default DashboardLoading;
