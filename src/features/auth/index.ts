/**
 * Public cross-feature API of the auth feature.
 *
 * Other features and the route layer resolve identity, session,
 * organization context, and session lifecycle through this module only.
 * Everything else under `features/auth/*` is a private internal of the
 * feature.
 */
export { getAuthState } from "./data/queries/session-state";
export { getServerSession } from "./infrastructure/auth/session";
export { signOutSession } from "./data/mutations/session";
export type {
  AuthActionResult,
  AuthState,
  SafeOrganization,
  SafeUser,
} from "./data/dto/auth-dto";
