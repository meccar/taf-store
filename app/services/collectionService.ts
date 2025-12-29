import type { AdminAPI } from "../types/admin";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionListParams,
} from "../types/category.types";
import { collectionRepository } from "../repositories/collectionRepository";

/**
 * Collection Service - Business logic layer for collections/categories
 */
export class CollectionService {
  /**
   * Create a new collection with business logic
   */
  async createCollection(
    admin: AdminAPI,
    input: CreateCollectionInput,
  ): Promise<Collection> {
    // Business logic: Validate input
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Collection title is required");
    }

    // Business logic: Set default published status
    const collectionInput: CreateCollectionInput = {
      ...input,
      published: input.published !== false,
    };

    return await collectionRepository.create(admin, collectionInput);
  }

  /**
   * Update an existing collection
   */
  async updateCollection(
    admin: AdminAPI,
    input: UpdateCollectionInput,
  ): Promise<Collection> {
    if (!input.id) {
      throw new Error("Collection ID is required");
    }

    return await collectionRepository.update(admin, input);
  }

  /**
   * Get a collection by ID
   */
  async getCollectionById(
    admin: AdminAPI,
    id: string,
  ): Promise<Collection | null> {
    if (!id) {
      throw new Error("Collection ID is required");
    }

    return await collectionRepository.findById(admin, id);
  }

  /**
   * Get all collections with optional filtering
   */
  async getAllCollections(
    admin: AdminAPI,
    params?: CollectionListParams,
  ): Promise<Collection[]> {
    return await collectionRepository.findAll(admin, params);
  }

  /**
   * Delete a collection
   */
  async deleteCollection(admin: AdminAPI, id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Collection ID is required");
    }

    return await collectionRepository.delete(admin, id);
  }

  /**
   * Add products to a collection
   */
  async addProductsToCollection(
    admin: AdminAPI,
    collectionId: string,
    productIds: string[],
  ): Promise<boolean> {
    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    if (!productIds || productIds.length === 0) {
      throw new Error("At least one product ID is required");
    }

    return await collectionRepository.addProducts(
      admin,
      collectionId,
      productIds,
    );
  }

  /**
   * Remove products from a collection
   */
  async removeProductsFromCollection(
    admin: AdminAPI,
    collectionId: string,
    productIds: string[],
  ): Promise<boolean> {
    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    if (!productIds || productIds.length === 0) {
      throw new Error("At least one product ID is required");
    }

    return await collectionRepository.removeProducts(
      admin,
      collectionId,
      productIds,
    );
  }

  /**
   * Business logic: Validate collection data
   */
  validateCollectionInput(
    input: CreateCollectionInput | UpdateCollectionInput,
  ): void {
    if ("title" in input && input.title && input.title.trim().length === 0) {
      throw new Error("Collection title cannot be empty");
    }
  }
}

// Export singleton instance
export const collectionService = new CollectionService();

// Export default
export default collectionService;
