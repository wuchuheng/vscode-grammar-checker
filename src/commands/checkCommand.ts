import * as vscode from "vscode";
import { correctComments } from "../api/correctComments";
import {
  EditOperation,
  wordLevenshteinDistance,
} from "../utils/shteinDistance";
import { Comment, extractComments } from "../utils/typescriptUtil";
import { translateEditionToRange } from "../utils/vscodeUtils";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";
import { HoverInformation, setEditions } from "../store/store";
import { diagnosticCode, diagnosticSource } from "../config/config";

export type CommentBindEdition = {
  comment: Comment;
  editions: EditOperation[];
};

/**
 * Registers the "GrammarChecker.check" command.
 */
export const checkCommand = vscode.commands.registerCommand(
  "GrammarChecker.check",
  async () => {
    // 1. Handling input.
    // 1.1 Get the Comments from the TypeScript file.
    const editor = vscode.window.activeTextEditor;
    if (editor === null) {
      return;
    }
    // 1.2 If the file is not a TypeScript file, return.
    if (editor!.document.languageId !== "typescript") {
      return;
    }

    // 1.3 Get the comments from the TypeScript file.
    const sourceText = editor!.document.getText();
    const comments = extractComments(sourceText, editor!.document);

    // 2. Processing logic.
    // 2.1 Get the corrected comments.
    const tasks: Promise<string>[] = [];
    comments.forEach((comment) => {
      tasks.push(correctComments(comment.text));
    });
    const correctedComments = await Promise.all(tasks);

    // 2.2 Convert the corrected comments to list of deditions.

    const commentBindEditions: CommentBindEdition[] = [];
    correctedComments.forEach((correctedComment, index) => {
      const comment = comments[index];
      const editions = wordLevenshteinDistance(comment.text, correctedComment);
      commentBindEditions.push({ comment, editions });
    });

    // 2.3 Add the diagnostics to the editor.
    const diagnostics: vscode.Diagnostic[] = [];
    const document = editor!.document;
    const hoverInformationList: HoverInformation[] = [];
    commentBindEditions.forEach((commentBindEdition) => {
      commentBindEdition.editions.forEach((edition) => {
        const range = translateEditionToRange(
          commentBindEdition.comment,
          edition
        );

        // 2.3.2 Create the diagnostic.
        commentBindEdition.comment.text;
        edition.sourceCharIndex;
        commentBindEdition.comment.start;
        const diagnostic = new vscode.Diagnostic(
          range,
          "Correct your spelling",
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = diagnosticSource;
        diagnostic.code = diagnosticCode;

        diagnostics.push(diagnostic);
        diagnosticCollection.set(document.uri, diagnostics);

        // 2.4 Collect the hover information.
        hoverInformationList.push({
          edition,
          comment: commentBindEdition.comment,
          range,
        });
      });
    });

    // 2.5 Store the hover information to the store.
    const fileName = editor!.document.fileName;
    setEditions(fileName, hoverInformationList);

    // 3. Return the result.
  }
);

// TODO: Implement logic to get all comments from the TypeScript file.

// const range = new vscode.Range(start, end);
// const diagnostic = new vscode.Diagnostic(
//   range,
//   "Correct your spelling",
//   vscode.DiagnosticSeverity.Warning
// );
// diagnostic.source = "GrammarChecker";
// diagnostics.push(diagnostic);

// diagnosticCollection.set(document.uri, diagnostics);
