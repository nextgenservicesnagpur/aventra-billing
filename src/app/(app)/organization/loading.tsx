/**
 * Organization loading state. Minimal placeholder shown while the segment
 * loads; replaced by real content as the feature grows.
 */
const OrganizationLoading = () => (
  <main className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 text-center text-foreground">
    <p className="text-sm text-text-muted">Loading organization…</p>
  </main>
);

export default OrganizationLoading;
