import * as vscode from "vscode";
import { getEdition } from "../store/store";
import { diagnosticCode } from "../config/config";

export class CodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    _: vscode.CancellationToken
  ): vscode.CodeAction[] {
    // 1. Handling input.
    // 2. Processing logic.
    // 2.1 Get the hover information by the start position of the range.
    const startPosition = range.start;
    const hoverInformation = getEdition(document.fileName, startPosition);
    if (!hoverInformation) {
      return [];
    }

    // 2.2 Create the code action.
    const result = context.diagnostics
      .filter((diagnostic) => diagnostic.code === diagnosticCode)
      .map((diagnostic) => this.createFix(document, diagnostic, range));

    // 3. Return result.

    return result;
  }

  private createFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    range: vscode.Range
  ): vscode.CodeAction {
    // 1. Handling input.
    // 2. Processing logic.
    // 2.1 Find the hover information by the start position of the range.
    const startPostion = range.start;
    const hoverInformation = getEdition(document.fileName, startPostion);
    if (!hoverInformation) {
      throw new Error("Hover information not found.");
    }

    // 2.2 Create the code action.
    // 2.2.1 Create the title of the code action.
    let title = "";
    switch (hoverInformation.edition.type) {
      case "delete":
        title = `Delete "${hoverInformation.edition.fromWord}"`;

        break;
      case "insert":
        title = `Insert "${hoverInformation.edition.toWord}"`;
        break;
      case "modify":
        title = `Replace "${hoverInformation.edition.fromWord}" with "${hoverInformation.edition.toWord}"`;
        break;
    }

    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      diagnostic.range,
      hoverInformation.edition.toWord
    );
    fix.diagnostics = [diagnostic];
    fix.isPreferred = true;

    // 3. Return result.
    return fix;
  }
}
