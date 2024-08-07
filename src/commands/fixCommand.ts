import * as vscode from "vscode";
import { fixCommandIdentifier } from "../config/config";
import { DiagnosticStore, HoverInformation } from "../store/diagnosticStore";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";
import { reloadDiagnosticCollection } from "../utils/diagnosticUtil";
import { ChangedOperation } from "../utils/compareSentenceUtil";
import LanguageAdapterManager from "../adapters/languageAdapterManager";
import { setFlashState } from "../store/isChangeFromActionCodeStore";
import { Comment } from "../utils/diagnosticUtil";

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
    ).supportedLanguageId;
    if (!supertedLangIds.includes(document.languageId)) {
      console.error(`The file: ${document.fileName} is not supported.`);
      return;
    }

    // 2. Processing logic.
    // 2.1 Set the state to true. This state will be used to check if the changes are from the action code or not.
    setFlashState(true);
    // 2.2 Update the document content with the range.
    const replacedWord = hoverInformation.edition.toWord;

    const edit = new vscode.WorkspaceEdit();

    const { range } = inputDiagnostic;
    switch (hoverInformation.edition.type) {
      case "delete":
        // 2.2.1 Delete the word.
        edit.delete(document.uri, range);
        break;
      case "insert":
        // 2.2.2 Insert the word.
        edit.insert(document.uri, range.start, replacedWord);
        break;
      case "modify":
        // 2.2.3 Modify the word.
        // Delete the word.
        edit.delete(document.uri, range);
        // And then insert the new word.
        edit.insert(document.uri, range.start, replacedWord);
        break;
    }

    // Apply the edit
    vscode.workspace.applyEdit(edit);

    // 2.3 Update the hover information.
    // 2.3.1 Remove the hover information from the store.
    DiagnosticStore.delete({
      fileName: document.fileName,
      id: inputDiagnostic.code as number,
    });

    // 2.4 Update the diagnostics for the document.
    const newDiagnostics: vscode.Diagnostic[] = [];
    for (const diagnostic of diagnosticCollection.get(document.uri)!) {
      // 2.4.1  Pick the new diagnostics.
      if (diagnostic.code !== inputDiagnostic.code) {
        const isSameLine =
          inputDiagnostic.range.start.line === diagnostic.range.start.line;
        const isBehing =
          inputDiagnostic.range.end.character <=
          diagnostic.range.start.character;
        const changedWordCount =
          hoverInformation.edition.toWord.length -
          hoverInformation.edition.fromWord.length;
        // 2.4.2 Update the range of the diagnostic when the diagnostic is behind the inputDiagnostic.
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
    // 2.4.2 Clear the old diagnostics and set the new diagnostics.
    reloadDiagnosticCollection(document.uri, newDiagnostics);

    // 3. Return the result.
  }
);
