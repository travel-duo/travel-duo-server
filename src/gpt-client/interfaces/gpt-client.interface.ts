export interface IGptClient {
  generateResponse(options?: Record<string, any>): Promise<any>;

  generateStreamResponse(options?: Record<string, any>): Promise<any>;
}
