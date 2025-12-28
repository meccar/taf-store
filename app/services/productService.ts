import type { AdminAPI } from "../types/admin";
import * as shopifyRepo from "../repositories/shopifyRepository";

export async function createProductFlow(admin: AdminAPI) {
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];

  const title = `${color} Snowboard`;

  const product = await shopifyRepo.createProduct(admin, title);

  const variantId = product.variants.edges[0]!.node!.id!;

  const updatedVariants = await shopifyRepo.updateVariants(admin, product.id, [
    { id: variantId, price: "100.00" },
  ]);

  return { product, variant: updatedVariants };
}

export default { createProductFlow };
