export interface ISttClient {
  transcribe(
    audioFilePath: string,
    options?: Record<string, any>,
  ): Promise<Record<string, any>>;
}
