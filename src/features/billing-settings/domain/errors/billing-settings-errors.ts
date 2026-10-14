export class BillingSettingsDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingSettingsDomainError";
  }
}

export class InvalidNumberFormatError extends BillingSettingsDomainError {
  constructor(reason: string) {
    super(`Invalid document numbering format: ${reason}`);
    this.name = "InvalidNumberFormatError";
  }
}

export class SettingsNotFoundError extends BillingSettingsDomainError {
  constructor(documentType: string) {
    super(`Billing settings for document type "${documentType}" not found.`);
    this.name = "SettingsNotFoundError";
  }
}

export class UnauthorizedSettingsAccessError extends BillingSettingsDomainError {
  constructor(message = "Unauthorized access to organization billing settings.") {
    super(message);
    this.name = "UnauthorizedSettingsAccessError";
  }
}
