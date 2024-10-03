export interface IOcrClient {
  detectText(imagePath: string): Promise<Record<string, any>>;
}
