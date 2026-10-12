/**
 * Organization page composition. Minimal placeholder establishing the
 * feature boundary: profile, settings, members, and roles arrive with
 * future requirements. Application-level organization behavior belongs
 * here; membership identity stays in the auth feature.
 */
export const OrganizationPage = () => (
  <main className="flex min-h-dvh w-full flex-col bg-background px-6 py-10 text-foreground">
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-text-primary">
        Organization
      </h1>
      <p className="mt-3 text-text-secondary">
        Your organization details and settings will live here.
      </p>
    </div>
  </main>
);
