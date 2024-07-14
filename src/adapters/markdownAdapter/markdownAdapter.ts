import { Position, TextDocument } from "vscode";
import LanguageAdapterInterface, {
  RequestData,
} from "../languageAdapter.interface";
import { Comment } from "../typescriptAdapter/typescriptUtil";
import { markdownPrompt } from "../../prompts/markdownPrompt";

export default class MarkdownAdapter implements LanguageAdapterInterface {
  supertedLanguageId: string[] = ["markdown"];

  extractComments(document: TextDocument): Comment[] {
    const comments: Comment[] = document
      .getText()
      .split("\n")
      .map((line, index) => {
        const comment: Comment = {
          text: line,
          start: new Position(index, 0),
          end: new Position(index, line.length),
        };
        return comment;
      });

    return comments;
  }

  async middlewareHandle(args: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string[]>;
  }): Promise<string[]> {
    const prompt = markdownPrompt;
    const response = await args.next({
      ...args.requestArgs,
      prompt,
    });

    return response;
  }
}
