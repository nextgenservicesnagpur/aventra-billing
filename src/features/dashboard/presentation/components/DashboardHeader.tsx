import Link from "next/link";
import { signOutSession } from "@/features/auth";
import { AventraBrand } from "@/shared/components/AventraBrand";
import { getDashboardHeaderContext } from "../../data/queries/header-context";
import { toDashboardHeaderModel } from "../view-models/dashboardHeader";
import { DashboardSearch } from "./DashboardSearch";
import { NotificationButton } from "./NotificationButton";
import { MegaMenu } from "./MegaMenu";
import { UserMenu } from "./UserMenu";
import { WorkspaceContext } from "./WorkspaceContext";
import {
  DashboardHeaderReveal,
  DashboardHeaderRevealItem,
} from "./DashboardHeaderReveal";

/**
 * Dashboard header: a server component so the session context resolves
 * before markup exists and no client fetch, cookie parsing, or provider
 * detail ever reaches the UI. Composed as three areas — identity and
 * workspace on the left, search in the center, notifications and the
 * account menu on the right — over a sticky, token-styled bar that the
 * future sidebar can sit beside. The sign-out action is passed to the
 * client menu as a server action reference.
 */
export const DashboardHeader = async () => {
  const model = toDashboardHeaderModel(await getDashboardHeaderContext());

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <DashboardHeaderReveal className="mx-auto flex h-14 w-full items-center gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3 lg:gap-4">
          <DashboardHeaderRevealItem className="flex shrink-0">
            <Link
              href="/dashboard"
              className="shrink-0 rounded-sm transition-opacity hover:opacity-80"
            >
              <AventraBrand />
            </Link>
          </DashboardHeaderRevealItem>
          {model.workspace !== null && (
            <DashboardHeaderRevealItem className="flex min-w-0">
              <WorkspaceContext name={model.workspace.name} />
            </DashboardHeaderRevealItem>
          )}
        </div>

        <DashboardHeaderRevealItem className="hidden flex-1 min-w-0 md:block">
          <DashboardSearch />
        </DashboardHeaderRevealItem>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          <DashboardHeaderRevealItem className="flex shrink-0">
            <NotificationButton />
          </DashboardHeaderRevealItem>
          <DashboardHeaderRevealItem className="flex shrink-0">
            <MegaMenu />
          </DashboardHeaderRevealItem>
          <DashboardHeaderRevealItem className="flex shrink-0">
            {model.account !== null ? (
              <UserMenu account={model.account} onSignOut={signOutSession} />
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 rounded-full bg-surface-alt"
              />
            )}
          </DashboardHeaderRevealItem>
        </div>
      </DashboardHeaderReveal>
    </header>
  );
};
