import { FileUploadResult } from "./types";

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type FileUploadResponse = ApiResponse<{ files: FileUploadResult[] }>;