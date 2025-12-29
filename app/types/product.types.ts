/**
 * Product domain types and DTOs
 */

export interface ProductVariant {
  id: string;
  price: string;
  barcode?: string;
  createdAt?: string;
  title?: string;
  sku?: string;
  inventoryQuantity?: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  description?: string;
  variants?: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
}

export interface CreateProductInput {
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: "ACTIVE" | "ARCHIVED" | "DRAFT";
}

export interface UpdateProductInput {
  id: string;
  title?: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: "ACTIVE" | "ARCHIVED" | "DRAFT";
}

export interface UpdateVariantInput {
  id: string;
  price?: string;
  barcode?: string;
  sku?: string;
  inventoryQuantity?: number;
}

export interface ProductListParams {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}
