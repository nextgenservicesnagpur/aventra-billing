export class InvoiceDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceDomainError";
  }
}

export class InvoiceNotFoundError extends InvoiceDomainError {
  constructor(id: string) {
    super(`Invoice with ID or Number "${id}" was not found.`);
    this.name = "InvoiceNotFoundError";
  }
}

export class UnauthorizedInvoiceAccessError extends InvoiceDomainError {
  constructor(message = "Unauthorized access to invoice.") {
    super(message);
    this.name = "UnauthorizedInvoiceAccessError";
  }
}

export class InvalidInvoiceStatusTransitionError extends InvoiceDomainError {
  constructor(currentStatus: string, action: string) {
    super(`Cannot ${action} invoice in "${currentStatus}" status.`);
    this.name = "InvalidInvoiceStatusTransitionError";
  }
}

export class DuplicateInvoiceNumberError extends InvoiceDomainError {
  constructor(invoiceNumber: string) {
    super(`Invoice number "${invoiceNumber}" already exists in this organization.`);
    this.name = "DuplicateInvoiceNumberError";
  }
}

export class InvalidCustomerReferenceError extends InvoiceDomainError {
  constructor(customerId: string) {
    super(`Customer "${customerId}" is invalid or does not belong to this organization.`);
    this.name = "InvalidCustomerReferenceError";
  }
}
