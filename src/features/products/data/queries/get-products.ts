import "server-only";

import { resolveProductContext } from "../context/product-context";
import { productRepository } from "../../infrastructure/repositories/prisma-product-repository";
import { toProductDto } from "../mappers/product-mappers";
import type { ProductDto, ProductFilterInput } from "../dto/product-dto";

export type GetProductsResult = {
  products: ProductDto[];
  totalCount: number;
};

export const getProducts = async (
  filter?: ProductFilterInput,
): Promise<GetProductsResult> => {
  const { organizationId } = await resolveProductContext();

  const result = await productRepository.list(organizationId, {
    type: filter?.type,
    status: filter?.status,
    category: filter?.category,
    query: filter?.query,
    limit: filter?.limit ?? 50,
    offset: filter?.offset ?? 0,
  });

  return {
    products: result.products.map(toProductDto),
    totalCount: result.totalCount,
  };
};
