import type { AdminAPI } from "../types/admin";
import type { ICollectionRepository } from "../types/repository.types";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionListParams,
} from "../types/category.types";

interface UserError {
  field?: string[] | null;
  message: string;
}

export class CollectionRepository implements ICollectionRepository {
  async create(
    admin: AdminAPI,
    input: CreateCollectionInput,
  ): Promise<Collection> {
    const response = await admin.graphql(
      `#graphql
        mutation createCollection($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              title
              handle
              description
              image {
                url
                altText
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
          input: {
            title: input.title,
            descriptionHtml: input.description,
            image: input.image ? { src: input.image } : undefined,
          },
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.collectionCreate?.userErrors &&
      json.data.collectionCreate.userErrors.length > 0
    ) {
      throw new Error(
        json.data.collectionCreate.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    const collection = json.data?.collectionCreate?.collection;
    if (!collection) {
      throw new Error("Failed to create collection");
    }

    return {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description || undefined,
      image: collection.image
        ? {
            url: collection.image.url,
            altText: collection.image.altText || undefined,
          }
        : undefined,
    };
  }

  async update(
    admin: AdminAPI,
    input: UpdateCollectionInput,
  ): Promise<Collection> {
    const response = await admin.graphql(
      `#graphql
        mutation updateCollection($input: CollectionInput!) {
          collectionUpdate(input: $input) {
            collection {
              id
              title
              handle
              description
              image {
                url
                altText
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
          input: {
            id: input.id,
            title: input.title,
            descriptionHtml: input.description,
            image: input.image ? { src: input.image } : undefined,
          },
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.collectionUpdate?.userErrors &&
      json.data.collectionUpdate.userErrors.length > 0
    ) {
      throw new Error(
        json.data.collectionUpdate.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    const collection = json.data?.collectionUpdate?.collection;
    if (!collection) {
      throw new Error("Failed to update collection");
    }

    return {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description || undefined,
      image: collection.image
        ? {
            url: collection.image.url,
            altText: collection.image.altText || undefined,
          }
        : undefined,
    };
  }

  async findById(admin: AdminAPI, id: string): Promise<Collection | null> {
    const response = await admin.graphql(
      `#graphql
        query getCollection($id: ID!) {
          collection(id: $id) {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            productsCount {
              count
            }
          }
        }`,
      {
        variables: { id },
      },
    );

    const json = await response.json();
    const collection = json.data?.collection;
    if (!collection) {
      return null;
    }

    return {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description || undefined,
      image: collection.image
        ? {
            url: collection.image.url,
            altText: collection.image.altText || undefined,
          }
        : undefined,
      productsCount: collection.productsCount?.count || undefined,
    };
  }

  async findAll(
    admin: AdminAPI,
    params?: CollectionListParams,
  ): Promise<Collection[]> {
    const first = params?.first || 25;
    const query = params?.query || "";
    const sortKey =
      (params?.sortKey as unknown as
        | "CREATED"
        | "ID"
        | "RELEVANCE"
        | "TITLE"
        | "UPDATED_AT") || "CREATED";
    const reverse = params?.reverse || false;

    const response = await admin.graphql(
      `#graphql
        query getCollections($first: Int!, $query: String, $sortKey: CollectionSortKeys, $reverse: Boolean) {
          collections(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                id
                title
                handle
                description
                image {
                  url
                  altText
                }
                productsCount {
                  count
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
    const collections =
      json.data?.collections?.edges?.map(
        (edge: {
          node: {
            id: string;
            title: string;
            handle: string;
            description?: string | null;
            image?: { url: string; altText?: string | null } | null;
            productsCount?: { count: number } | null;
          };
        }) => {
          const node = edge.node;
          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            description: node.description || undefined,
            image: node.image
              ? {
                  url: node.image.url,
                  altText: node.image.altText || undefined,
                }
              : undefined,
            productsCount: node.productsCount?.count || undefined,
          };
        },
      ) || [];
    return collections;
  }

  async delete(admin: AdminAPI, id: string): Promise<boolean> {
    const response = await admin.graphql(
      `#graphql
        mutation deleteCollection($input: CollectionDeleteInput!) {
          collectionDelete(input: $input) {
            deletedCollectionId
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
      json.data?.collectionDelete?.userErrors &&
      json.data.collectionDelete.userErrors.length > 0
    ) {
      throw new Error(
        json.data.collectionDelete.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    return !!json.data?.collectionDelete?.deletedCollectionId;
  }

  async addProducts(
    admin: AdminAPI,
    collectionId: string,
    productIds: string[],
  ): Promise<boolean> {
    const response = await admin.graphql(
      `#graphql
        mutation addProductsToCollection($id: ID!, $productIds: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $productIds) {
            collection {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          id: collectionId,
          productIds,
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.collectionAddProducts?.userErrors &&
      json.data.collectionAddProducts.userErrors.length > 0
    ) {
      throw new Error(
        json.data.collectionAddProducts.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    return !!json.data?.collectionAddProducts?.collection;
  }

  async removeProducts(
    admin: AdminAPI,
    collectionId: string,
    productIds: string[],
  ): Promise<boolean> {
    const response = await admin.graphql(
      `#graphql
        mutation removeProductsFromCollection($id: ID!, $productIds: [ID!]!) {
          collectionRemoveProducts(id: $id, productIds: $productIds) {
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          id: collectionId,
          productIds,
        },
      },
    );

    const json = await response.json();

    if (
      json.data?.collectionRemoveProducts?.userErrors &&
      json.data.collectionRemoveProducts.userErrors.length > 0
    ) {
      throw new Error(
        json.data.collectionRemoveProducts.userErrors
          .map((e: UserError) => e.message)
          .join(", "),
      );
    }

    return !json.data?.collectionRemoveProducts?.userErrors?.length;
  }
}

// Export singleton instance
export const collectionRepository = new CollectionRepository();
