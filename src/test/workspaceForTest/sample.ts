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

type RemoveUselessEmptyLineResultType = {
  newLines: RemoveCommentFormatResultType[];
  removedLineIndexs: number[];
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
    comment: string
  ): RemoveCommentFormatResultType[] {
    // 1. Handling input.
    // 2. Processing logic.
    let lines = comment.split("\n");
    // 2.1 Build the edits
    const edits: RemoveCommentFormatResultType[] = lines.map((line) => {
      // 2.1.1 Extract the spaces and the formated format character before the comment comment.
      const regexPattern = /^\s*(:?\*\/\s*|\/\*+\s?|\*?\s*(\d\.*)*\s*)/gm;
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

  removeSingleLineCommentFormat(line: string): RemoveCommentFormatResultType[] {
    // 1. Handling input.
    // 2. Processing logic.

    // 2.1.1 Extract the spaces and the formated format character before the comment comment.
    const regexPattern = /^\s*\/\/+\s*(\d\.*)*\s*/;
    const spacesBeforeComment = line.match(regexPattern);
    const prefix: string = spacesBeforeComment ? spacesBeforeComment[0] : "";
    const result = [
      {
        prefix,
        line: line.substring(prefix.length),
      },
    ];

    // 3. Return the result.
    return result;
  }

  removeUselessEmptyLine(
    lineInfoList: RemoveCommentFormatResultType[]
  ): RemoveUselessEmptyLineResultType {
    // 1. Input handling.
    // 2. Processing logic.
    // 2.1 Remove the empty lines at the top.

    // 2.2.1 Count the top empty lines and remove them.

    // 3. Return the result.
    throw Error("Method not implemented.");
  }

  async middlewareHandle({
    requestArgs,
    next,
  }: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string>;
  }): Promise<string> {
    // 1. Handing input.
    // 2. Processing logic.
    // 2.1 Remove the track comment format.
    const unformatComments =
      requestArgs.commentType === "track"
        ? this.removeTrackLineCommentFormat(requestArgs.data)
        : this.removeSingleLineCommentFormat(requestArgs.data);

    // 2.2 Remove the empty lines.
    const removedEmptyLineIndexList: number[] = [];
    const lines = unformatComments.filter((comment, i) => {
      if (comment.line.trim() === "") {
        removedEmptyLineIndexList.push(i);
        return false;
      }
      return true;
    });

    // 2.3 Send the request to the OpenAI API, and get the response from the API.
    const data: string = lines.map((line) => line.line).join("\n");
    const args: RequestData = {
      ...requestArgs,
      prompt: typescriptPrompt,
      data,
    };
    let response = await next(args);

    // 2.4 Remove the prefix of the comment. like: `//` and `*` before the comment, because the character is removed before sending the request, and if the response contains the character, the character should be removed.
    const removedResult =
      requestArgs.commentType === "track"
        ? this.removeTrackLineCommentFormat(response)
        : this.removeSingleLineCommentFormat(response);
    response = removedResult.map((comment) => comment.line).join("\n");

    // 2.4 Restore the empty lines.
    const responseLines = response.split("\n");
    removedEmptyLineIndexList.forEach((index) => {
      responseLines.splice(index, 0, "");
    });

    // 2.5 Restore the removed format for each line.
    unformatComments.forEach((comment, index) => {
      responseLines[index] = comment.prefix + responseLines[index];
    });

    const result = responseLines.join("\n");

    // 2.6　Log the result.
    if (result !== requestArgs.data) {
      LogUtil.debug(`
The changes of the comment:
input: ${requestArgs.data}
output: ${result}`);
    }

    // 3. Return the result.
    return result;
  }
}
