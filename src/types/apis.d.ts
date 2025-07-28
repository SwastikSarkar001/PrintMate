import { FileUploadResult, UserWithoutPassword } from "./types";

/**
 * Generic API response type that standardizes all API responses across the application.
 * 
 * @template T - The type of data returned in successful responses
 * 
 * @example
 * ```typescript
 * // Success response
 * const successResponse: ApiResponse<User> = {
 *   success: true,
 *   data: { id: 1, name: "John" }
 * };
 * 
 * // Error response
 * const errorResponse: ApiResponse<User> = {
 *   success: false,
 *   message: "User not found",
 *   errors: { id: "Invalid user ID" }
 * };
 * ```
 */
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

/**
 * API response type for file upload operations.
 * 
 * @remarks
 * This type wraps the generic ApiResponse with file upload specific data structure.
 * On success, it returns an array of FileUploadResult objects containing information
 * about each uploaded file.
 * 
 * @example
 * ```typescript
 * const uploadResponse: FileUploadResponse = {
 *   success: true,
 *   data: {
 *     files: [
 *       { filename: "document.pdf", size: 1024, url: "/uploads/document.pdf" }
 *     ]
 *   }
 * };
 * ```
 */
export type FileUploadResponse = ApiResponse<{ files: FileUploadResult[] }>;

/**
 * API response type for checking resource availability operations.
 * 
 * @remarks
 * Used to verify if a resource (like email, phone number, etc.) is available for use.
 * The checks object provides detailed information about what specific validations
 * were performed and their results.
 * 
 * @example
 * ```typescript
 * const availabilityResponse: CheckAvailabilityResponse = {
 *   success: true,
 *   data: {
 *     available: true,
 *     checks: {
 *       email: true,
 *       phone: true
 *     },
 *     message: "All checks passed"
 *   }
 * };
 * ```
 */
export type CheckAvailabilityResponse = ApiResponse<{
  available: boolean;
  checks: Record<string, boolean>;
  message: string;
}>;

export type UserAuthResponse = ApiResponse<{
  user: UserWithoutPassword
}>
