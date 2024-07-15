import * as vscode from "vscode";
import { updateDiagnostic } from "./updateDiagnosticUtil";
import { updateDiagnosticInCurrentComment as updateDiagnosticInCurrentCommentPosition } from "./updateDiagnosticInCurrentComment";
import { getFlashState } from "../../store/isChangeFromActionCodeStore";

/**
 * Handles the event triggered when the text document is changed.
 *
 * This function is designed to respond to changes in a text document within the Visual Studio Code environment.
 * It processes the changes and updates diagnostics related to the document. The function performs several checks
 * and operations based on the content of the changes.
 *
 * @param event - The event object that contains information about the text document change. This includes the document
 * itself and the range of text that has been changed.
 *
 * Note: This function is part of a larger system that manages diagnostics within a text editor. Diagnostics are issues
 * in the code, such as errors or warnings, that are identified by the editor's analysis tools.
 */
export const onDidChangeTextDocumentProvider = (
  event: vscode.TextDocumentChangeEvent
) => {
  // 1. Processing input.
  // 1.1 If the changes is empty, then return.
  if (event.contentChanges.length === 0) {
    return;
  }

  // 2. Processing logic.
  // 2.1 If the changes are from the action code, then return.
  const isChangeFromActionCode = getFlashState();
  if (isChangeFromActionCode) {
    return;
  }

  // 2.2 Update the position of the diagnostic in the document after the changes.
  updateDiagnosticInCurrentCommentPosition(event);

  // 2.3 Update the diagnostic for the new changes
  updateDiagnostic(event);
};
