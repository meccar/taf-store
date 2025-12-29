/**
 * Base repository interfaces and types
 */

import type { AdminAPI } from "./admin";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  UpdateVariantInput,
  ProductListParams,
} from "./product.types";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionListParams,
} from "./category.types";

export interface IProductRepository {
  create(admin: AdminAPI, input: CreateProductInput): Promise<Product>;
  update(admin: AdminAPI, input: UpdateProductInput): Promise<Product>;
  findById(admin: AdminAPI, id: string): Promise<Product | null>;
  findAll(admin: AdminAPI, params?: ProductListParams): Promise<Product[]>;
  delete(admin: AdminAPI, id: string): Promise<boolean>;
  updateVariants(
    admin: AdminAPI,
    productId: string,
    variants: UpdateVariantInput[],
  ): Promise<
    Array<{
      id: string;
      price: string;
      barcode?: string | null;
      createdAt?: string | null;
      sku?: string | null;
    }>
  >;
}

export interface ICollectionRepository {
  create(admin: AdminAPI, input: CreateCollectionInput): Promise<Collection>;
  update(admin: AdminAPI, input: UpdateCollectionInput): Promise<Collection>;
  findById(admin: AdminAPI, id: string): Promise<Collection | null>;
  findAll(
    admin: AdminAPI,
    params?: CollectionListParams,
  ): Promise<Collection[]>;
  delete(admin: AdminAPI, id: string): Promise<boolean>;
  addProducts(
    admin: AdminAPI,
    collectionId: string,
    productIds: string[],
  ): Promise<boolean>;
  removeProducts(
    admin: AdminAPI,
    collectionId: string,
    productIds: string[],
  ): Promise<boolean>;
}
