export type UserLoginRequestBody = {
  identifier: string;
  password: string;
}

export type FileUploadResult = {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
};

export interface CloudinaryFile {
  id: string;
  name: string;
  publicId: string;
  type: string;
  size: string;
  modified: string;
  url: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
}

export interface CloudinaryApiResponse {
  files: CloudinaryFile[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface CloudinarySearchParams {
  cursor?: string;
  limit?: number;
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

// Cloudinary API response types
export interface CloudinaryResource {
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  access_mode: string;
}