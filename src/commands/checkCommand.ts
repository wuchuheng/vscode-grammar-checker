import * as vscode from "vscode";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";

export const checkCommand = vscode.commands.registerCommand(
  "GrammarChecker.check",
  () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    const commentRegex = /\/\/.*$/gm;
    let match;
    while ((match = commentRegex.exec(text)) !== null) {
      const comment = match[0];
      const index = match.index;

      if (comment.includes("helo")) {
        const start = document.positionAt(index + comment.indexOf("helo"));
        const end = document.positionAt(
          index + comment.indexOf("helo") + "helo".length
        );
        const range = new vscode.Range(start, end);
        const diagnostic = new vscode.Diagnostic(
          range,
          "Correct your spelling",
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = "GrammarChecker";
        diagnostics.push(diagnostic);
      }
    }

    diagnosticCollection.set(document.uri, diagnostics);
  }
);
