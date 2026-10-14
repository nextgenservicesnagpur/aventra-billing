import "server-only";

import { resolveProductContext } from "../context/product-context";
import { productRepository } from "../../infrastructure/repositories/prisma-product-repository";
import { toProductDto } from "../mappers/product-mappers";
import type { ProductDto } from "../dto/product-dto";

export const getProductById = async (id: string): Promise<ProductDto | null> => {
  const { organizationId } = await resolveProductContext();
  const product = await productRepository.findById(organizationId, id);

  if (!product) return null;
  return toProductDto(product);
};
