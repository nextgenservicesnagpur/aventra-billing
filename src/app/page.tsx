import { RootEntryPage } from "@/features/auth/presentation/page/RootEntryPage";

export const dynamic = "force-dynamic";

/**
 * Root route. Thin composition boundary: session-aware root entry
 * (server session resolution, splash sequence, navigation) lives in the
 * auth feature's RootEntryPage.
 */
const RootRoutePage = () => <RootEntryPage />;

export default RootRoutePage;
