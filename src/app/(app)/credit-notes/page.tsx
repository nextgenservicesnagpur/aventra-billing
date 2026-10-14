import { getCreditNotes } from "@/features/credit-notes/data/queries/get-credit-notes";
import { CreditNoteListPage } from "@/features/credit-notes/presentation/page/CreditNoteListPage";

export const dynamic = "force-dynamic";

const CreditNotesRoute = async () => {
  const { creditNotes } = await getCreditNotes();
  return <CreditNoteListPage initialCreditNotes={creditNotes} />;
};

export default CreditNotesRoute;
