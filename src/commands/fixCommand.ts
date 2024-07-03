import * as vscode from "vscode";
import { EditOperation } from "../utils/shteinDistance";
import { Comment } from "../utils/typescriptUtil";
import { fixCommandIdentifier } from "../config/config";
import { HoverInformation, removeEdition } from "../store/store";
import { supportedLanguages } from "../config/config";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";
import { generateDiagnosticCode } from "../utils/diagnasticUtil";

export type CommentBindEdition = {
  comment: Comment;
  editions: EditOperation[];
};

/**
 * Registers the "GrammarChecker.fix" command.
 */
export const fixCommand = vscode.commands.registerCommand(
  fixCommandIdentifier,
  (
    document: vscode.TextDocument,
    inputDiagnostic: vscode.Diagnostic,
    hoverInformation: HoverInformation
  ): void => {
    // 1. Handling input.
    // 1.1 Validate the command.
    if (!supportedLanguages.includes(document.languageId)) {
      console.error(`The file: ${document.fileName} is not supported.`);
      return;
    }

    // 2. Processing logic.
    // 2.1 Update the document content with the range.
    const replacedWord = hoverInformation.edition.toWord;

    const edit = new vscode.WorkspaceEdit();

    const { range } = inputDiagnostic;
    switch (hoverInformation.edition.type) {
      case "delete":
        // 2.1.1 Delete the word.
        edit.delete(document.uri, range);
        break;
      case "insert":
        // 2.1.2 Insert the word.
        edit.insert(document.uri, range.start, replacedWord);
        break;
      case "modify":
        // 2.1.3 Modify the word.
        // Delete the word.
        edit.delete(document.uri, range);
        // And then insert the new word.
        edit.insert(document.uri, range.start, replacedWord);
        break;
    }

    // Apply the edit
    vscode.workspace.applyEdit(edit);

    // 2.2 Update the diagnostics for the document.
    // 2.2.1 Remove the inputDiagnostic from the diagnostic collection.
    const newDiagnostics = diagnosticCollection
      .get(document.uri)!
      .filter((diagnostic) => {
        return diagnostic.code !== inputDiagnostic.code;
      });

    // 2.2.2 Update the diagnostic collection with the new diagnostics.
    diagnosticCollection.set(document.uri, newDiagnostics);

    // 2.3 Update the hover information.
    // 2.3.1 Remove the item from the hover information.
    removeEdition(
      document.fileName,
      generateDiagnosticCode(inputDiagnostic.range)
    );

    // 3. Return the result.
  }
);
