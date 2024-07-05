import * as vscode from "vscode";
import { Comment } from "../adapters/typescriptAdapter/typescriptUtil";
import { fixCommandIdentifier } from "../config/config";
import { DiagnasticStore, HoverInformation } from "../store/diagnasticStore";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";
import { reloadDiagnosticCollection } from "../utils/diagnasticUtil";
import { ChangedOperation } from "../utils/compareSentenceUtil";
import LanguageAdapterManager from "../adapters/languageAdapterManager";

export type CommentBindEdition = {
  comment: Comment;
  editions: ChangedOperation[];
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
    const supertedLangIds = LanguageAdapterManager.getAdapter(
      document.languageId
    ).supertedLanguageId;
    if (!supertedLangIds.includes(document.languageId)) {
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

    // 2.2 Update the hover information.
    // 2.2.1 Remove the hover information from the store.
    DiagnasticStore.delete({
      fileName: document.fileName,
      id: inputDiagnostic.code as number,
    });

    // 2.3 Update the diagnostics for the document.
    const newDiagnostics: vscode.Diagnostic[] = [];
    for (const diagnostic of diagnosticCollection.get(document.uri)!) {
      // 2.3.1  Pick the new diagnostics.
      if (diagnostic.code !== inputDiagnostic.code) {
        const isSameLine =
          inputDiagnostic.range.start.line === diagnostic.range.start.line;
        const isBehing =
          inputDiagnostic.range.end.character <=
          diagnostic.range.start.character;
        const changedWordCount =
          hoverInformation.edition.toWord.length -
          hoverInformation.edition.fromWord.length;
        // 2.3.2 Update the range of the diagnostic when the diagnostic is behind the inputDiagnostic.
        if (isSameLine && isBehing && changedWordCount !== 0) {
          const startLine = diagnostic.range.start.line;
          const startChart =
            diagnostic.range.start.character + changedWordCount;
          const endLine = diagnostic.range.end.line;
          const endChart = diagnostic.range.end.character + changedWordCount;
          const newRange = new vscode.Range(
            new vscode.Position(startLine, startChart),
            new vscode.Position(endLine, endChart)
          );
          diagnostic.range = newRange;
        }

        newDiagnostics.push(diagnostic);
      }
    }
    // 2.3.2 Clear the old diagnostics and set the new diagnostics.
    reloadDiagnosticCollection(document.uri, newDiagnostics);

    // 3. Return the result.
  }
);
