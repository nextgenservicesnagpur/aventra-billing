import { describe, expect, it, vi, beforeEach } from "vitest";
import { PrismaCustomerRepository } from "./prisma-customer-repository";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock getPrisma
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/shared/lib/prisma", () => ({
  getPrisma: () => ({
    customer: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  }),
}));

describe("PrismaCustomerRepository", () => {
  let repository: PrismaCustomerRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PrismaCustomerRepository();
  });

  it("strictly scopes findById query to the active organization", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const result = await repository.findById("org-test-1", "cust-1");
    expect(result).toBeNull();
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        id: "cust-1",
        organizationId: "org-test-1",
      },
    });
  });

  it("strictly scopes list queries and search filters to organizationId", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    const result = await repository.list("org-test-1", {
      query: "Acme",
      customerType: "BUSINESS",
      status: "ACTIVE",
      limit: 10,
      offset: 0,
    });

    expect(result.customers).toEqual([]);
    expect(result.totalCount).toBe(0);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org-test-1",
          customerType: "BUSINESS",
          status: "ACTIVE",
          OR: expect.arrayContaining([
            { name: { contains: "Acme", mode: "insensitive" } },
          ]),
        }),
        skip: 0,
        take: 10,
      }),
    );
  });

  it("deletes customer scoped to organization and customer ID", async () => {
    mockDelete.mockResolvedValueOnce({ id: "cust-1" });

    await repository.delete("org-test-1", "cust-1");

    expect(mockDelete).toHaveBeenCalledWith({
      where: {
        id: "cust-1",
        organizationId: "org-test-1",
      },
    });
  });
});
