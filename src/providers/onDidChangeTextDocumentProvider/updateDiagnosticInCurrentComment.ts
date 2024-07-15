import * as vscode from "vscode";
import LanguageAdapterManager from "../../adapters/languageAdapterManager";
import { checkCommandIdentifier } from "../../config/config";
import { debounce } from "@wuchuhengtools/helper";

/**
 * Debounces the update of diagnostics in comments within a document. This function is triggered by text document change events.
 * It first checks if the change event contains any content changes. If not, it exits early. It then verifies if there is a language adapter
 * available for the document's language. If an adapter is not available, it exits early.
 *
 * The function proceeds to collect comments from the document that might be affected by the changes. It categorizes the changes into
 * insertions, replacements, or deletions, and identifies the comments affected by these changes. Finally, it updates the diagnostics
 * for these affected comments after a debounce period of 2000 milliseconds, ensuring that diagnostics are not updated too frequently,
 * which can be resource-intensive.
 *
 * @param event - The text document change event that triggers the diagnostic update. This event contains the document where the change
 * occurred and the details of the change.
 */
export const updateDiagnosticInCurrentComment =
  debounce<vscode.TextDocumentChangeEvent>((event) => {
    // 1. Handling input.
    // 1.1 If the changes is empty, return.
    if (event.contentChanges.length === 0) {
      return;
    }

    // 1.2 Check if the change is in a comment; otherwise, return.
    const hasAdapter = LanguageAdapterManager.has(event.document.languageId);
    if (!hasAdapter) {
      return;
    }
    // 2. Processing logic.

    // 2.1 Collect the comments that will be affected by the changes.
    const affectedComments = LanguageAdapterManager.getAdapter(
      event.document.languageId
    ).onDidChangeTextDocument(event);

    // 2.2 Update the diagnostics in the affected comments.
    vscode.commands.executeCommand(checkCommandIdentifier, affectedComments);

    // 3. Handling output.
  }, 2000);
