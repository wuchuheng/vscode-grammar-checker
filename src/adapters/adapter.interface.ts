export type CommentType = "single" | "track";
export type RequestArgs = {
  prompt: string;
  commentType: CommentType;
  data: string;
};
export interface LanguageAdapterInterface {
  /**
   * The middleware to be executed before the request is made.
   *
   * The request will be executed like this:
   * Vs code command -> beforeRequest -> AI model -> vscode command
   * @param requestArgs
   * @param next
   * @returns
   */
  beforeRequest: (
    requestArgs: RequestArgs,
    next: (args: RequestArgs) => Promise<string>
  ) => Promise<string>;
}
