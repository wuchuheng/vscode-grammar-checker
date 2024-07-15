import * as vscode from "vscode";
import { fixCommandIdentifier, diagnosticSource } from "../config/config";
import { DiagnosticStore } from "../store/diagnosticStore";

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

    // 2.1 Create the code action.
    const result = context.diagnostics
      .filter((diagnostic) => diagnostic.source === diagnosticSource)
      .map((diagnostic) => this.fixIssueBuilder(document, diagnostic));

    // 3. Return result.

    return result;
  }

  private fixIssueBuilder(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    // 1. Handling input.
    // 2. Processing logic.
    // 2.1 Find the hover information by the start position of the range.
    const hoverInformation = DiagnosticStore.get({
      fileName: document.fileName,
      id: diagnostic.code as number,
    });

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

    // 2.2.2 Create the code action.
    const actionHandler = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.QuickFix
    );
    actionHandler.edit = new vscode.WorkspaceEdit();
    actionHandler.command = {
      command: fixCommandIdentifier,

      title: "Grammar Checker: Fix",
      arguments: [document, diagnostic, hoverInformation],
    };
    actionHandler.diagnostics = [diagnostic];
    actionHandler.isPreferred = true;

    // 3. Return result.
    return actionHandler;
  }
}
