import "server-only";

import { resolveCreditNoteContext } from "../context/credit-note-context";
import { creditNoteRepository } from "../../infrastructure/repositories/prisma-credit-note-repository";
import type { CreditNote } from "../../domain/credit-note";

export const getCreditNoteById = async (
  id: string,
): Promise<CreditNote | null> => {
  const { organizationId } = await resolveCreditNoteContext();
  return await creditNoteRepository.findById(organizationId, id);
};
