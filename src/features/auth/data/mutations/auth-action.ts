import { mapAuthError } from "../../infrastructure/auth/auth-errors";
import { AuthError, ValidationError } from "../../domain/errors/auth-errors";
import type { AuthActionResult } from "../dto/auth-dto";

/**
 * Runs an auth server operation and converts any failure into the
 * serializable result envelope. Domain errors pass through with their
 * safe messages; provider failures are mapped; nothing raw ever leaves
 * the server boundary.
 */
export const runAuthAction = async <T>(
  operation: () => Promise<T>,
): Promise<AuthActionResult<T>> => {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    const appError = error instanceof AuthError ? error : mapAuthError(error);
    const result: Extract<AuthActionResult<T>, { ok: false }> = {
      ok: false,
      code: appError.code,
      message: appError.message,
    };
    if (appError instanceof ValidationError) {
      return { ...result, fieldErrors: appError.fieldErrors };
    }
    return result;
  }
};
