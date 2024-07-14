import * as vscode from "vscode";
import { correctComments } from "../../api/correctComments/correctComments";
import { Comment } from "../../adapters/typescriptAdapter/typescriptUtil";
import { checkCommandIdentifier } from "../../config/config";
import { commandValidator } from "../../validators/commandValidator";
import { defaultPrompt } from "../../prompts/defaultPrompt";
import { reloadDiagnosticCollection } from "../../utils/diagnasticUtil";
import {
  ChangedOperation,
  compareSentences,
  convertComparedSentences,
} from "../../utils/compareSentenceUtil";
import {
  CommentType,
  RequestData,
} from "../../adapters/languageAdapter.interface";
import {
  buildDiagnosticsAndHoverInformation,
  getAdapter,
  getComment,
  getDocument,
  removeInvalideChart,
  restoreRemovedText,
  setHoverInformation,
} from "./checkCommandUtil";

export type CommentBindEdition = {
  comment: Comment;
  editions: ChangedOperation[];
};

/**
 * Registers the "GrammarChecker.check" command.
 */
export const checkCommand = vscode.commands.registerCommand(
  checkCommandIdentifier,
  async (inputComments: Comment[] = []) => {
    // 1. Handling input.
    // 1.1 Validate the command.
    const isOk = commandValidator();
    if (!isOk) {
      return;
    }

    // 2. Processing logic.
    // 2.1 Get the comments from the adapter.
    const comments = getComment(inputComments);

    // 2.2 Collect the processing task for each comment to correct the comments.
    const tasks: Promise<string[]>[] = [];
    comments.forEach((comment) => {
      // 2.2.1 Determine the comment type.
      const commentType: CommentType =
        comment.start.line !== comment.end.line ? "track" : "single";

      let data = comment.text.split("\n");

      // 2.2.2 Remove prefix space characters preceded by each line
      const removedOutsideInvalidedChart = removeInvalideChart(data);
      // 2.2.3 Add the async task to the task list.
      const requestArgs: RequestData = {
        prompt: defaultPrompt,
        commentType,
        data: removedOutsideInvalidedChart.value,
      };
      const adapter = getAdapter();
      const newTask: Promise<string[]> = adapter
        .middlewareHandle({
          requestArgs,
          next: async (args) => {
            // 2.2.4 Remove the invalid characters from the middleward.
            const removdedMiddlewareInvalidChart = removeInvalideChart(
              args.data
            );
            const res = await correctComments({
              ...args,
              data: removdedMiddlewareInvalidChart.value,
            });
            // 2.2.4 Restore the removed text after the next called within the middleware.
            let result = restoreRemovedText(
              res,
              removdedMiddlewareInvalidChart.removedTextList
            );
            return result;
          },
        })
        .then((res) => {
          // 2.2.5 Restore the removed text after the middleware.
          res = restoreRemovedText(
            res,
            removedOutsideInvalidedChart.removedTextList
          );
          return res;
        });

      tasks.push(newTask);
    });
    const correctedComments = await Promise.all(tasks);

    // 2.3 Build the suggestions to correct the comments based on the comparison between the original comments and the corrected comments.
    const commentBindEditions: CommentBindEdition[] = [];
    correctedComments.forEach((correctedComment: string[], index) => {
      const comment = comments[index];

      const wordEdits = compareSentences(
        comment.text,
        correctedComment.join("\n")
      );
      const editions = convertComparedSentences(comment.text, wordEdits);

      commentBindEditions.push({ comment, editions });
    });

    // 2.4 Build the diagnostics and hover information.
    const { diagnostics, hoverInformationList } =
      buildDiagnosticsAndHoverInformation(commentBindEditions);

    // 2.7 Update the diagnostic collection.
    const document = getDocument();
    reloadDiagnosticCollection(document.uri, diagnostics);

    // 2.8 Store the hover information to the store.
    setHoverInformation(hoverInformationList);

    // 3. Return the result.
  }
);
