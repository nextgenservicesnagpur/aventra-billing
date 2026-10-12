import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { getAuthState } from "../../data/queries/session-state";
import { rootEntryDestination } from "../view-models/rootEntry";
import {
  RootEntryTransition,
  type RootEntryTransitionProps,
} from "./RootEntryTransition";

/**
 * Root entry composition for `/`. The authoritative Better Auth session is
 * resolved on the server before any markup exists: unauthenticated and
 * unverified states keep the existing `/auth` experience, while a verified
 * session receives the centered Aventra splash and a single programmatic
 * navigation to the dashboard. No client-side session parsing, no Welcome
 * flash, and no auth UI during the transition.
 */
export const RootEntryPage = async (): Promise<
  ReactElement<RootEntryTransitionProps>
> => {
  const state = await getAuthState();
  const destination = rootEntryDestination(state);
  if (destination === "/auth") {
    redirect(destination);
  }
  return <RootEntryTransition destination={destination} />;
};
