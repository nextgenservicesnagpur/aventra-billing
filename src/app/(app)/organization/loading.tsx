/**
 * Organization loading state. Minimal placeholder shown while the segment
 * loads; replaced by real content as the feature grows.
 */
const OrganizationLoading = () => (
  <div className="flex w-full items-center justify-center py-24 text-center text-foreground">
    <p className="text-sm text-text-muted">Loading organization…</p>
  </div>
);
export default OrganizationLoading;
