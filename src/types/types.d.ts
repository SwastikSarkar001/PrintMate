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