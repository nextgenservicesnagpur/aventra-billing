import { describe, expect, it, vi, beforeEach } from "vitest";
import { getCustomers } from "./get-customers";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock customer context
vi.mock("../context/customer-context", () => ({
  resolveCustomerContext: vi.fn().mockResolvedValue({
    organizationId: "org-test-uuid",
    userId: "user-test-uuid",
  }),
}));

// Mock customerRepository
const mockList = vi.fn();

vi.mock("../../infrastructure/repositories/prisma-customer-repository", () => ({
  customerRepository: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

describe("getCustomers Query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves customers scoped strictly to the current authenticated organization", async () => {
    mockList.mockResolvedValueOnce({
      customers: [],
      totalCount: 0,
    });

    const result = await getCustomers({
      query: "Aventra",
      page: 1,
      pageSize: 8,
    });

    expect(result.customers).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(mockList).toHaveBeenCalledWith("org-test-uuid", {
      query: "Aventra",
      customerType: undefined,
      status: undefined,
      limit: 8,
      offset: 0,
    });
  });
});
