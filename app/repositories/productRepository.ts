import type { AdminAPI } from "../types/admin";
import type { IProductRepository } from "../types/repository.types";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  UpdateVariantInput,
  ProductListParams,
} from "../types/product.types";

interface UserError {
  field?: string[] | null;
  message: string;
}

export class ProductRepository implements IProductRepository {
  async create(admin: AdminAPI, input: CreateProductInput): Promise<Product> {
    const response = await admin.graphql(
      `#graphql
        mutation createProduct($product: ProductCreateInput!) {
          productCreate(product: $product) {
            product {
              id
              title
              handle
              status
              description
              variants(first: 10) {
                edges {
                  node {
                    id
                    price
                    barcode
                    createdAt
                    title
                    sku
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          product: {
            title: input.title,
            descriptionHtml: input.description,
            vendor: input.vendor,
            productType: input.productType,
            tags: input.tags,
            status: (input.status || "ACTIVE") as never,
          },
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.productCreate?.userErrors &&
      json.data.productCreate.userErrors.length > 0
    ) {
      throw new Error(
        json.data.productCreate.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    const product = json.data?.productCreate?.product;
    if (!product) {
      throw new Error("Failed to create product");
    }

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      description: product.description || undefined,
      variants: product.variants
        ? {
            edges: product.variants.edges.map(
              (edge: {
                node: {
                  id: string;
                  price: string;
                  barcode?: string | null;
                  createdAt?: string | null;
                  title?: string | null;
                  sku?: string | null;
                };
              }) => ({
                node: {
                  id: edge.node.id,
                  price: edge.node.price,
                  barcode: edge.node.barcode || undefined,
                  createdAt: edge.node.createdAt || undefined,
                  title: edge.node.title || undefined,
                  sku: edge.node.sku || undefined,
                },
              }),
            ),
          }
        : undefined,
    };
  }

  async update(admin: AdminAPI, input: UpdateProductInput): Promise<Product> {
    const response = await admin.graphql(
      `#graphql
        mutation updateProduct($product: ProductUpdateInput!) {
          productUpdate(product: $product) {
            product {
              id
              title
              handle
              status
              description
              variants(first: 10) {
                edges {
                  node {
                    id
                    price
                    barcode
                    createdAt
                    title
                    sku
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          product: {
            id: input.id,
            title: input.title,
            descriptionHtml: input.description,
            vendor: input.vendor,
            productType: input.productType,
            tags: input.tags,
            status: input.status as never,
          },
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.productUpdate?.userErrors &&
      json.data.productUpdate.userErrors.length > 0
    ) {
      throw new Error(
        json.data.productUpdate.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    const product = json.data?.productUpdate?.product;
    if (!product) {
      throw new Error("Failed to update product");
    }

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      description: product.description || undefined,
      variants: product.variants
        ? {
            edges: product.variants.edges.map(
              (edge: {
                node: {
                  id: string;
                  price: string;
                  barcode?: string | null;
                  createdAt?: string | null;
                  title?: string | null;
                  sku?: string | null;
                };
              }) => ({
                node: {
                  id: edge.node.id,
                  price: edge.node.price,
                  barcode: edge.node.barcode || undefined,
                  createdAt: edge.node.createdAt || undefined,
                  title: edge.node.title || undefined,
                  sku: edge.node.sku || undefined,
                },
              }),
            ),
          }
        : undefined,
    };
  }

  async findById(admin: AdminAPI, id: string): Promise<Product | null> {
    const response = await admin.graphql(
      `#graphql
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            handle
            status
            description
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                  title
                  sku
                }
              }
            }
          }
        }`,
      {
        variables: { id },
      },
    );

    const json = await response.json();
    const product = json.data?.product;
    if (!product) {
      return null;
    }

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      description: product.description || undefined,
      variants: product.variants
        ? {
            edges: product.variants.edges.map(
              (edge: {
                node: {
                  id: string;
                  price: string;
                  barcode?: string | null;
                  createdAt?: string | null;
                  title?: string | null;
                  sku?: string | null;
                };
              }) => ({
                node: {
                  id: edge.node.id,
                  price: edge.node.price,
                  barcode: edge.node.barcode || undefined,
                  createdAt: edge.node.createdAt || undefined,
                  title: edge.node.title || undefined,
                  sku: edge.node.sku || undefined,
                },
              }),
            ),
          }
        : undefined,
    };
  }

  async findAll(
    admin: AdminAPI,
    params?: ProductListParams,
  ): Promise<Product[]> {
    const first = params?.first || 25;
    const query = params?.query || "";
    const sortKey =
      (params?.sortKey as unknown as
        | "CREATED_AT"
        | "ID"
        | "PRICE"
        | "PRODUCT_TYPE"
        | "RELEVANCE"
        | "TITLE"
        | "UPDATED_AT"
        | "VENDOR") || "CREATED_AT";
    const reverse = params?.reverse || false;

    const response = await admin.graphql(
      `#graphql
        query getProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
          products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                id
                title
                handle
                status
                description
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price
                    }
                  }
                }
              }
            }
          }
        }`,
      {
        variables: {
          first,
          query: query || undefined,
          sortKey: sortKey as never,
          reverse,
        },
      },
    );

    const json = await response.json();
    return (
      json.data?.products?.edges?.map(
        (edge: {
          node: {
            id: string;
            title: string;
            handle: string;
            status: string;
            description?: string | null;
            variants?: {
              edges: Array<{ node: { id: string; price: string } }>;
            } | null;
          };
        }) => {
          const node = edge.node;
          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            status: node.status,
            description: node.description || undefined,
            variants: node.variants
              ? {
                  edges: node.variants.edges.map(
                    (vEdge: { node: { id: string; price: string } }) => ({
                      node: {
                        id: vEdge.node.id,
                        price: vEdge.node.price,
                      },
                    }),
                  ),
                }
              : undefined,
          };
        },
      ) || []
    );
  }

  async delete(admin: AdminAPI, id: string): Promise<boolean> {
    const response = await admin.graphql(
      `#graphql
        mutation deleteProduct($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          input: {
            id,
          },
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.productDelete?.userErrors &&
      json.data.productDelete.userErrors.length > 0
    ) {
      throw new Error(
        json.data.productDelete.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    return !!json.data?.productDelete?.deletedProductId;
  }

  async updateVariants(
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
  > {
    const response = await admin.graphql(
      `#graphql
        mutation updateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants {
              id
              price
              barcode
              createdAt
              sku
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          productId,
          variants: variants.map((v) => ({
            id: v.id,
            price: v.price,
            barcode: v.barcode,
            sku: v.sku,
            inventoryQuantities: v.inventoryQuantity
              ? [
                  {
                    availableQuantity: v.inventoryQuantity,
                    locationId: "gid://shopify/Location/1",
                  },
                ]
              : undefined,
          })),
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.productVariantsBulkUpdate?.userErrors &&
      json.data.productVariantsBulkUpdate.userErrors.length > 0
    ) {
      throw new Error(
        json.data.productVariantsBulkUpdate.userErrors
          .map((e: { field?: string[] | null; message: string }) => e.message)
          .join(", "),
      );
    }

    return json.data!.productVariantsBulkUpdate!.productVariants || [];
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
