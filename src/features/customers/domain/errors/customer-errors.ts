export class CustomerDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerDomainError";
  }
}

export class CustomerNotFoundError extends CustomerDomainError {
  constructor(id?: string) {
    super(id ? `Customer with ID '${id}' was not found.` : "Customer not found.");
    this.name = "CustomerNotFoundError";
  }
}

export class CustomerValidationError extends CustomerDomainError {
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "CustomerValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class CustomerDuplicateError extends CustomerDomainError {
  constructor(field: string, value: string) {
    super(`A customer with ${field} '${value}' already exists in this organization.`);
    this.name = "CustomerDuplicateError";
  }
}

export class UnauthorizedCustomerAccessError extends CustomerDomainError {
  constructor() {
    super("Authentication is required to perform customer operations.");
    this.name = "UnauthorizedCustomerAccessError";
  }
}

export class ForbiddenCustomerActionError extends CustomerDomainError {
  constructor() {
    super("You do not have permission to modify customer records in this organization.");
    this.name = "ForbiddenCustomerActionError";
  }
}
