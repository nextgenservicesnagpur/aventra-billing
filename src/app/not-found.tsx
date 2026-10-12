import { NotFoundView } from "@/shared/components/NotFoundView";

/**
 * Next.js App Router root 404 handler.
 * Thin composition boundary delegating to the shared NotFoundView presentation.
 */
const NotFound = () => <NotFoundView />;

export default NotFound;
