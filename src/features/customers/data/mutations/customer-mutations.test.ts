import { describe, expect, it, vi, beforeEach } from "vitest";
import { createCustomerAction } from "./create-customer";
import { updateCustomerAction } from "./update-customer";
import { deleteCustomerAction } from "./delete-customer";

// Mock server-only and next/cache
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock customer context
vi.mock("../context/customer-context", () => ({
  resolveCustomerContext: vi.fn().mockResolvedValue({
    organizationId: "org-test-uuid",
    userId: "user-test-uuid",
  }),
}));

// Mock customerRepository
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockFindById = vi.fn();

vi.mock("../../infrastructure/repositories/prisma-customer-repository", () => ({
  customerRepository: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    findById: (...args: unknown[]) => mockFindById(...args),
  },
}));

describe("Customer Server Mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCustomerAction", () => {
    it("returns validation failure when customer name is missing", async () => {
      const res = await createCustomerAction({
        name: "",
        customerType: "BUSINESS",
        gstTreatment: "CONSUMER_UNREGISTERED",
        status: "ACTIVE",
        billingAddress: {
          addressLine1: "123 Street",
          city: "Pune",
          state: "Maharashtra",
          pinCode: "411001",
          country: "India",
        },
      });

      expect(res.success).toBe(false);
      expect(res.fieldErrors?.name).toBeDefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("successfully creates a customer scoped to the active organization", async () => {
      const now = new Date();
      mockCreate.mockImplementation(async (customer) => ({
        ...customer,
        createdAt: now,
        updatedAt: now,
      }));

      const res = await createCustomerAction({
        name: "Test Customer Co",
        customerType: "BUSINESS",
        gstTreatment: "CONSUMER_UNREGISTERED",
        status: "ACTIVE",
        billingAddress: {
          addressLine1: "123 Street",
          city: "Pune",
          state: "Maharashtra",
          pinCode: "411001",
          country: "India",
        },
      });

      expect(res.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org-test-uuid",
          name: "Test Customer Co",
        }),
      );
    });
  });

  describe("updateCustomerAction", () => {
    it("returns error if target customer is not found in organization", async () => {
      mockFindById.mockResolvedValueOnce(null);

      const res = await updateCustomerAction("cust-nonexistent", {
        name: "Updated Name",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("not found");
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteCustomerAction", () => {
    it("deletes customer when found in the authenticated organization", async () => {
      mockFindById.mockResolvedValueOnce({ id: "cust-1", organizationId: "org-test-uuid" });
      mockDelete.mockResolvedValueOnce(undefined);

      const res = await deleteCustomerAction("cust-1");

      expect(res.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith("org-test-uuid", "cust-1");
    });
  });
});
