import type { AdminAPI } from "../types/admin";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  UpdateVariantInput,
  ProductListParams,
} from "../types/product.types";
import { productRepository } from "../repositories/productRepository";

/**
 * Product Service - Business logic layer for products
 */
export class ProductService {
  /**
   * Create a new product with business logic
   */
  async createProduct(
    admin: AdminAPI,
    input: CreateProductInput,
  ): Promise<Product> {
    // Business logic: Validate input
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Product title is required");
    }

    // Business logic: Set default status if not provided
    const productInput: CreateProductInput = {
      ...input,
      status: input.status || "ACTIVE",
    };

    return await productRepository.create(admin, productInput);
  }

  /**
   * Create a product with a random color variant (example business flow)
   */
  async createProductFlow(admin: AdminAPI): Promise<{
    product: Product;
    variant: Array<{
      id: string;
      price: string;
      barcode?: string | null;
      createdAt?: string | null;
      sku?: string | null;
    }>;
  }> {
    const colors = ["Red", "Orange", "Yellow", "Green"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const title = `${color} Snowboard`;

    const product = await this.createProduct(admin, {
      title,
      status: "ACTIVE",
    });

    // Get the first variant and update its price
    const variantId = product.variants?.edges[0]?.node?.id;
    if (!variantId) {
      throw new Error("Product created but no variant found");
    }

    const updatedVariants = await this.updateProductVariants(
      admin,
      product.id,
      [{ id: variantId, price: "100.00" }],
    );

    return { product, variant: updatedVariants };
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    admin: AdminAPI,
    input: UpdateProductInput,
  ): Promise<Product> {
    if (!input.id) {
      throw new Error("Product ID is required");
    }

    return await productRepository.update(admin, input);
  }

  /**
   * Get a product by ID
   */
  async getProductById(admin: AdminAPI, id: string): Promise<Product | null> {
    if (!id) {
      throw new Error("Product ID is required");
    }

    return await productRepository.findById(admin, id);
  }

  /**
   * Get all products with optional filtering
   */
  async getAllProducts(
    admin: AdminAPI,
    params?: ProductListParams,
  ): Promise<Product[]> {
    return await productRepository.findAll(admin, params);
  }

  /**
   * Delete a product
   */
  async deleteProduct(admin: AdminAPI, id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Product ID is required");
    }

    return await productRepository.delete(admin, id);
  }

  /**
   * Update product variants
   */
  async updateProductVariants(
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
    if (!productId) {
      throw new Error("Product ID is required");
    }

    if (!variants || variants.length === 0) {
      throw new Error("At least one variant is required");
    }

    return await productRepository.updateVariants(admin, productId, variants);
  }

  /**
   * Business logic: Validate product data
   */
  validateProductInput(input: CreateProductInput | UpdateProductInput): void {
    if ("title" in input && input.title && input.title.trim().length === 0) {
      throw new Error("Product title cannot be empty");
    }
  }
}

// Export singleton instance
export const productService = new ProductService();

// Export default for backward compatibility
export default productService;
