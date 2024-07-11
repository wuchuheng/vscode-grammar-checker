import * as vscode from "vscode";
import { correctComments } from "../api/correctComments";
import { Comment } from "../adapters/typescriptAdapter/typescriptUtil";
import { translateEditionToRange } from "../utils/vscodeUtils";
import { DiagnasticStore, HoverInformation } from "../store/diagnasticStore";
import { checkCommandIdentifier, diagnosticSource } from "../config/config";
import { commandValidator } from "../validators/commandValidator";
import { correctCommentPrompt } from "../prompts/commentCorrectedPrompt";
import {
  generateCode,
  reloadDiagnosticCollection,
} from "../utils/diagnasticUtil";
import {
  ChangedOperation,
  compareSentences,
  convertComparedSentences,
} from "../utils/compareSentenceUtil";
import LanguageAdapterManager from "../adapters/languageAdapterManager";
import {
  CommentType,
  RequestData,
} from "../adapters/languageAdapter.interface";

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
    const editor = vscode.window.activeTextEditor!;
    const document = editor!.document;
    const adapter = LanguageAdapterManager.getAdapter(document.languageId);

    const comments =
      inputComments.length > 0
        ? inputComments
        : adapter.extractComments(document);
    // 2.2 Collect the processing task for each comment to correct the comments.
    const tasks: Promise<string>[] = [];
    comments.forEach((comment) => {
      // 2.2.1 Call the request middleware of the adapter where the adapter can do something for a specific language before the request is made.
      const commentType: CommentType =
        comment.start.line !== comment.end.line ? "track" : "single";
      const requestArgs: RequestData = {
        prompt: correctCommentPrompt,
        commentType: commentType,
        data: comment.text,
      };
      const newTask = adapter.middlewareHandle({
        requestArgs,
        next: async (args) => correctComments(args),
      });

      // 2.2.3 Add the task to the list.
      tasks.push(newTask);
    });
    const correctedComments = await Promise.all(tasks);

    // 2.3 Convert the corrected comments to list of deditions.
    const commentBindEditions: CommentBindEdition[] = [];
    correctedComments.forEach((correctedComment, index) => {
      const comment = comments[index];

      const wordEdits = compareSentences(comment.text, correctedComment);
      const editions = convertComparedSentences(comment.text, wordEdits);

      commentBindEditions.push({ comment, editions });
    });

    // 2.4 Add the diagnostics to the editor.
    const diagnostics: vscode.Diagnostic[] = [];
    const hoverInformationList: HoverInformation[] = [];
    commentBindEditions.forEach((commentBindEdition) => {
      commentBindEdition.editions.forEach((edition) => {
        const range = translateEditionToRange(
          commentBindEdition.comment,
          edition
        );

        // 2.3.2 Create the diagnostic.
        commentBindEdition.comment.text;
        edition.chartIndex;
        commentBindEdition.comment.start;
        const diagnostic = new vscode.Diagnostic(
          range,
          "Correct your spelling",
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = diagnosticSource;
        diagnostic.code = generateCode();
        // 2.5 Collect the diagnostics for the step #2.7
        diagnostics.push(diagnostic);

        // 2.6 Collect the hover information for the step #2.8
        hoverInformationList.push({
          edition,
          comment: commentBindEdition.comment,
          diagnostic,
        });
      });
    });

    // 2.7 Update the diagnostic collection.
    reloadDiagnosticCollection(document.uri, diagnostics);

    // 2.8 Store the hover information to the store.
    const fileName = editor!.document.fileName;
    // 2.8.1 Clear the diagnostic in the store for this file.
    DiagnasticStore.clear(fileName);
    // 2.8.2 Add the diagnostic to the store.
    hoverInformationList.forEach((item) => {
      DiagnasticStore.set({
        fileName,
        id: item.diagnostic.code as number,
        value: item,
      });
    });

    // 3. Return the result.
  }
);
