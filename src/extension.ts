import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection("simpleGrammarCheck");
  context.subscriptions.push(diagnosticCollection);

  let disposable = vscode.commands.registerCommand(
    "simpleGrammarCheck.check",
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
            'Correct your spelling',
            vscode.DiagnosticSeverity.Warning
          );
          diagnostic.source = "GrammarChecker";
          diagnostics.push(diagnostic);
        }
      }

      diagnosticCollection.set(document.uri, diagnostics);
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: "file", language: "typescript" },
      new HeloCodeActionProvider(),
      {
        providedCodeActionKinds: HeloCodeActionProvider.providedCodeActionKinds,
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      "typescript",
      new HeloHoverProvider()
    )
  );
}

export function deactivate() {}

class HeloCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === "helo")
      .map((diagnostic) => this.createFix(document, diagnostic));
  }

  private createFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(
      `Replace "helo" with "hello"`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(document.uri, diagnostic.range, "hello");
    fix.diagnostics = [diagnostic];
    fix.isPreferred = true;
    return fix;
  }
}

class HeloHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, /helo/);
    if (range) {
      const markdownString = new vscode.MarkdownString();
      markdownString.appendMarkdown(
        `**Change the verb form**

The plural verb 
**are**
 does not appear to agree with the singular subject 
**This**
. Consider changing the verb form for subject-verb agreement.


… This 
<span style="color:#F00;">~~are~~</span>
is …`
      );
      markdownString.isTrusted = true;
      return new vscode.Hover(markdownString, range);
    }
    return null;
  }
}
