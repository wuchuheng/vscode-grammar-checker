import * as vscode from "vscode";
import { HoverProvider } from "./providers/hoverProvider";
import { CodeActionProvider } from "./providers/codeActionProvider";
import { checkCommand } from "./commands/checkCommand";
import { diagnosticCollection } from "./diagnosticCollection/diagnosticCollection";
import { fixCommand } from "./commands/fixCommand";
import LanguageAdapterManager from "./adapters/languageAdapterManager";

/**
 * Activates the extension.
 * @param context The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  // 1. Initialize the adapter manager.
  LanguageAdapterManager.initialize(context);

  // 2. Register the diagnostic collection to notify the user where the issues are in the source code.
  context.subscriptions.push(diagnosticCollection);

  // 3. Register the command: GrammarChecker.check to check the grammar when the user runs the command.
  context.subscriptions.push(checkCommand);
  context.subscriptions.push(fixCommand);

  // 4. Used to display the details of the error when there is an error and hover over the error.
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("typescript", new HoverProvider())
  );

  // 5. Provide the code actions to fix the error.
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: "file", language: "typescript" },
      new CodeActionProvider(),
      {
        providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds,
      }
    )
  );
}

export function deactivate() {}
