export interface IStorageClient {
  uploadFile(path: string, filePath: string): Promise<string>;

  streamUploadFile(path: string, filePath: string): Promise<string>;

  getFile(path: string): Promise<Buffer>;

  deleteFile(path: string): Promise<void>;
}
