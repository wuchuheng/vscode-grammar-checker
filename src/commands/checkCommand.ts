import * as vscode from "vscode";
import ts from "typescript";
import { correctComments } from "../api/correctComments";
import { wordLevenshteinDistance } from "../utils/shteinDistance";
import { extractComments } from "../utils/typescriptUtil";

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
    correctedComments.forEach((correctedComment, index) => {
      const comment = comments[index];
      const editions = wordLevenshteinDistance(comment.text, correctedComment);
    });

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
