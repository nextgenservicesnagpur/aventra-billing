import "server-only";

import { resolveCreditNoteContext } from "../context/credit-note-context";
import { creditNoteRepository } from "../../infrastructure/repositories/prisma-credit-note-repository";
import type { CreditNote } from "../../domain/credit-note";
import type { CreditNoteFilterCriteria } from "../../domain/repositories/credit-note-repository";

export const getCreditNotes = async (
  criteria?: CreditNoteFilterCriteria,
): Promise<{ creditNotes: CreditNote[] }> => {
  const { organizationId } = await resolveCreditNoteContext();
  const creditNotes = await creditNoteRepository.findMany(organizationId, criteria);
  return { creditNotes };
};
