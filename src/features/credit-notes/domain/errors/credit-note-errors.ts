export class CreditNoteDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditNoteDomainError";
  }
}

export class UnauthorizedCreditNoteAccessError extends CreditNoteDomainError {
  constructor(message = "Unauthorized access to credit note resources.") {
    super(message);
    this.name = "UnauthorizedCreditNoteAccessError";
  }
}

export class CreditNoteNotFoundError extends CreditNoteDomainError {
  constructor(identifier: string) {
    super(`Credit note '${identifier}' was not found in your organization.`);
    this.name = "CreditNoteNotFoundError";
  }
}

export class IneligibleInvoiceForCreditError extends CreditNoteDomainError {
  constructor(invoiceNumber: string, status: string) {
    super(
      `Invoice '${invoiceNumber}' with status '${status}' is ineligible for credit. Only issued or paid invoices can be credited.`,
    );
    this.name = "IneligibleInvoiceForCreditError";
  }
}

export class ExceededInvoiceCreditLimitError extends CreditNoteDomainError {
  constructor(
    attemptedCredit: number,
    availableCredit: number,
    invoiceNumber: string,
  ) {
    super(
      `Credit note amount (${attemptedCredit.toFixed(2)}) exceeds remaining creditable balance (${availableCredit.toFixed(2)}) for invoice '${invoiceNumber}'.`,
    );
    this.name = "ExceededInvoiceCreditLimitError";
  }
}

export class InvalidCreditNoteStatusTransitionError extends CreditNoteDomainError {
  constructor(currentStatus: string, operation: string) {
    super(
      `Cannot perform operation '${operation}' on a credit note with status '${currentStatus}'.`,
    );
    this.name = "InvalidCreditNoteStatusTransitionError";
  }
}

export class DuplicateCreditNoteNumberError extends CreditNoteDomainError {
  constructor(creditNoteNumber: string) {
    super(
      `Credit note number '${creditNoteNumber}' is already in use within your organization.`,
    );
    this.name = "DuplicateCreditNoteNumberError";
  }
}

export class CreditNoteImmutableError extends CreditNoteDomainError {
  constructor(creditNoteNumber: string) {
    super(
      `Issued credit note '${creditNoteNumber}' is financially immutable and cannot be modified.`,
    );
    this.name = "CreditNoteImmutableError";
  }
}

export class InvalidCreditNoteLineItemError extends CreditNoteDomainError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCreditNoteLineItemError";
  }
}
