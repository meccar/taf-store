/**
 * Category/Collection domain types and DTOs
 */

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
  productsCount?: number | { count: number };
}

export interface CreateCollectionInput {
  title: string;
  description?: string;
  image?: string;
  published?: boolean;
}

export interface UpdateCollectionInput {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  published?: boolean;
}

export interface CollectionListParams {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}
