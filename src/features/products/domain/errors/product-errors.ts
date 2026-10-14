export class ProductDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductDomainError";
  }
}

export class ProductNotFoundError extends ProductDomainError {
  constructor(id: string) {
    super(`Product with ID "${id}" was not found.`);
    this.name = "ProductNotFoundError";
  }
}

export class DuplicateSkuError extends ProductDomainError {
  constructor(sku: string) {
    super(`A product with SKU "${sku}" already exists in this organization.`);
    this.name = "DuplicateSkuError";
  }
}

export class UnauthorizedProductAccessError extends ProductDomainError {
  constructor(message = "You are not authorized to access this catalogue resource.") {
    super(message);
    this.name = "UnauthorizedProductAccessError";
  }
}

export class InvalidProductPriceError extends ProductDomainError {
  constructor(message = "Product price must be a non-negative number.") {
    super(message);
    this.name = "InvalidProductPriceError";
  }
}

export class InvalidHsnSacError extends ProductDomainError {
  constructor(message = "HSN/SAC code must be between 2 and 8 digits.") {
    super(message);
    this.name = "InvalidHsnSacError";
  }
}
