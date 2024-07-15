import * as vscode from "vscode";
import { updateDiagnostic } from "./updateDiagnosticUtil";
import { updateDiagnosticInCurrentComment as updateDiagnosticInCurrentCommentPosition } from "./updateDiagnosticInCurrentComment";
import { getFlashState } from "../../store/isChangeFromActionCodeStore";

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
