import * as vscode from "vscode";
import { HoverProvider } from "./providers/hoverProvider";
import { CodeActionProvider } from "./providers/codeActionProvider";
import { checkCommand } from "./commands/checkCommand/checkCommand";
import { diagnosticCollection } from "./diagnosticCollection/diagnosticCollection";
import { fixCommand } from "./commands/fixCommand";
import LanguageAdapterManager from "./adapters/languageAdapterManager";
import { onDidChangeTextDocumentProvider } from "./providers/onDidChangeTextDocumentProvider/onDidChangeTextDocumentProvider";
import { checkCommandIdentifier } from "./config/config";
import { setContext } from "./store/contextStore";
import { removedApiKeyCommand } from "./commands/removedApiKey";
import { statusBarIcon } from "./statusBarIcon/statusBarIcon";

/**
 * Activates the extension.
 * @param context The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  // 1. Store the context.
  setContext(context);

  // 2. Initialize the adapter manager.
  LanguageAdapterManager.initialize(context);

  // 3. Register the diagnostic collection to notify the user where the issues are in the source code.
  context.subscriptions.push(diagnosticCollection);

  // 4. Register the command: GrammarChecker.check to check the grammar when the user runs the command.
  context.subscriptions.push(checkCommand);
  context.subscriptions.push(fixCommand);
  context.subscriptions.push(removedApiKeyCommand);

  // 5. Used to display the details of the error when there is an error and hover over the error.
  LanguageAdapterManager.languageIds.forEach((languageId) => {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(languageId, new HoverProvider())
    );
  });

  // 6.1 Update the diagnostic store when the document is changed.
  vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocumentProvider);

  // 7. Provide the code actions to fix the error.
  LanguageAdapterManager.languageIds.forEach((languageId) => {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        { scheme: "file", language: languageId },
        new CodeActionProvider(),
        {
          providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds,
        }
      )
    );
  });

  // 7. Execute the command `grammarChecker.check()` when the file is opened.
  vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "plaintext") {
      // Optionally execute the command for the currently open file on startup
      vscode.commands.executeCommand(checkCommandIdentifier);
    }
  });

  // Add to subscriptions to ensure proper disposal.
  // Are you ok?
  context.subscriptions.push(statusBarIcon);
}

export function deactivate() {}
