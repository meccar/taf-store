/**
 * AdminAPI type - represents the Shopify Admin API client
 * This is the type returned from authenticate.admin(request).admin
 */
import type { authenticate } from "../shopify.server";

type AuthenticateAdmin = typeof authenticate.admin;
type AdminApiContext = Awaited<ReturnType<AuthenticateAdmin>>;
export type AdminAPI = AdminApiContext["admin"];
