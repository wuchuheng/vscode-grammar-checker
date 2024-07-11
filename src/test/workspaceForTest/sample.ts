import * as vscode from "vscode";
// @ts-ignore
import { updateDiagnostic } from "./updateDiagnosticUtil";
// @ts-ignore
import { updateDiagnosticInCurrentComment as updateDiagnosticInCurrentCommentPosition } from "./updateDiagnosticInCurrentComment";
import { getFlashState } from "../../store/isChangeFromActionCodeStore";

export const onDidChangeTextDocumentProvider = (
  event: vscode.TextDocumentChangeEvent
) => {
  // 2. Processing logic.
  // 2.1 If the changes are from the action code, then return.
  const isChangeFromActionCode = getFlashState();
  if (isChangeFromActionCode) {
    return;
  }

  // 2.2 Update the position of the diagnostic in the document after the changes.
  updateDiagnosticInCurrentCommentPosition(event);

  // 2.3 Update the diagnostics for the new changes.
  updateDiagnostic(event);
};
