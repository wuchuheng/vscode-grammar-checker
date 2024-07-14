import * as vscode from "vscode";
import LanguageAdapterInterface, {
  RequestData,
} from "../languageAdapter.interface";
import { Comment, extractComments } from "./typescriptUtil";
import { typescriptPrompt } from "../../prompts/typescriptPrompt";
import LogUtil from "../../utils/logUtil";

type RemoveCommentFormatResultType = {
  line: string;
  prefix: string;
};

export default class TypescriptAdapter implements LanguageAdapterInterface {
  supertedLanguageId: string[] = [
    "typescript",
    "javascript",
    "javascriptreact",
    "typescriptreact",
  ];

  extractComments(document: vscode.TextDocument): Comment[] {
    // 1. Handling input.
    // 2. Processing logic.
    const editor = vscode.window.activeTextEditor;
    const sourceText = document.getText();
    const result = extractComments(sourceText, editor!.document);

    // 3. Return the result.
    return result;
  }

  removeTrackLineCommentFormat(
    comment: string[]
  ): RemoveCommentFormatResultType[] {
    // 1. Handling input.
    // 2. Processing logic.
    let lines = comment;
    // 2.1 Build the edit.
    const edits: RemoveCommentFormatResultType[] = lines.map((line) => {
      // 2.1.1 Extract the spaces and the formatted format character before the comment.
      const regexPattern = /^(:?\*\/\s*|\/\*+\s?|\*?\s*(\d\.*)*\s*)/gm;
      const spacesBeforeComment = line.match(regexPattern);
      const prefix: string = spacesBeforeComment ? spacesBeforeComment[0] : "";
      return {
        prefix,
        line: line.substring(prefix.length),
      };
    });

    // 3. Return the result.
    return edits;
  }

  removeSingleLineCommentFormat(
    lines: string[]
  ): RemoveCommentFormatResultType[] {
    // 1. Handling input.
    // 2. Processing logic.

    // 2.1.1 Extract the spaces and formatted format characters before the comment.
    const regexPattern = /^\/\/+\s*(\d\.*)*\s*/;
    const text = lines.join("\n");
    const spacesBeforeComment = text.match(regexPattern);
    const prefix: string = spacesBeforeComment ? spacesBeforeComment[0] : "";
    const result = [
      {
        prefix,
        line: text.substring(prefix.length),
      },
    ];

    // 3. Return the result.
    return result;
  }

  async middlewareHandle({
    requestArgs,
    next,
  }: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string>;
  }): Promise<string[]> {
    // 1. Handling input.
    // 2. Processing logic.
    // 2.1 Remove the track comment format.
    const lines =
      requestArgs.commentType === "track"
        ? this.removeTrackLineCommentFormat(requestArgs.data)
        : this.removeSingleLineCommentFormat(requestArgs.data);

    // 2.2 Send the request to the OpenAI API, and get the response from the API.
    const data: string[] = lines.map((line) => line.line);
    const args: RequestData = {
      ...requestArgs,
      prompt: typescriptPrompt,
      data,
    };
    let response = (await next(args)).split("\n");

    // 2.3 Remove the prefix of the comment, like: `//` and `*` before the comment, because the character is removed before sending the request, and if the response contains the character, the character should be removed.
    const removedResult =
      requestArgs.commentType === "track"
        ? this.removeTrackLineCommentFormat(response)
        : this.removeSingleLineCommentFormat(response);
    response = removedResult.map((comment) => comment.line);

    const result = response;

    // 2.4 Restore the removed format for each line.
    lines.forEach((comment, index) => {
      result[index] = comment.prefix + result[index];
    });

    // 2.5　Log the result.
    if (result !== requestArgs.data) {
      LogUtil.debug(`
The changes of the comment:
input: ${requestArgs.data.join("\n")}
output: ${result.join("\n")}`);
    }

    // 3. Return the result.
    return result;
  }
}
