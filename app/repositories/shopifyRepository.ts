export async function createProduct(admin: any, title: string) {
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title,
        },
      },
    },
  );

  const json = await response.json();

  return json.data!.productCreate!.product!;
}

export async function updateVariants(
  admin: any,
  productId: string,
  variants: any[],
) {
  const response = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId,
        variants,
      },
    },
  );

  const json = await response.json();

  return json.data!.productVariantsBulkUpdate!.productVariants;
}

export default { createProduct, updateVariants };
