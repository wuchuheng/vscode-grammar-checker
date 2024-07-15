import * as vscode from "vscode";
import LanguageAdapterManager from "../../adapters/languageAdapterManager";
import { getChangedType } from "./updateDiagnosticUtil";
import { Comment } from "../../adapters/typescriptAdapter/typescriptUtil";
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
    const changes = event.contentChanges;
    const adapter = LanguageAdapterManager.getAdapter(
      event.document.languageId
    );
    // 2.1 Collect the comments that will be affected by the changes.
    const commentsInDocument = adapter.extractComments(event.document);
    const affectedComments: Comment[] = [];
    for (const change of changes) {
      const changeType = getChangedType(change);
      let currentAffectedComments: Comment[] = [];
      switch (changeType) {
        case "insert":
          currentAffectedComments = getAffectedCommentsByInsertChange(
            change,
            commentsInDocument
          );
          break;
        case "replace":
          currentAffectedComments = getAffectedCommentsByReplaceChange(
            change,
            commentsInDocument
          );
          break;
        case "delete":
          currentAffectedComments = getAffectedCommentsByDeleteChange(
            change,
            commentsInDocument
          );
          break;
      }
      affectedComments.push(...currentAffectedComments);
    }

    // 2.2 Update the diagnostics in the affected comments.
    updateDiagnosticInChangedComments(event.document, affectedComments);

    // 3. Handling output.
  }, 2000);

/**
 * Get the comments that will be affected by the insert change.
 * @param change
 */
function getAffectedCommentsByInsertChange(
  change: vscode.TextDocumentContentChangeEvent,
  commentsInDocument: Comment[]
): Comment[] {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];
  for (const comment of commentsInDocument) {
    // 2.1 If the change is in the comment, return the comment.
    if (
      change.range.start.line >= comment.start.line &&
      change.range.end.line <= comment.end.line
    ) {
      result.push(comment);
      break;
    }
  }

  // 3. Return the result.
  return result;
}

function getAffectedCommentsByReplaceChange(
  change: vscode.TextDocumentContentChangeEvent,
  commentsInDocument: Comment[]
): Comment[] {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];
  for (const comment of commentsInDocument) {
    // 2.1 If the change is in the comment, return the comment.
    if (
      change.range.start.line >= comment.start.line &&
      change.range.end.line <= comment.end.line
    ) {
      result.push(comment);
      break;
    }
  }

  // 3. Return the result.
  return result;
}

function getAffectedCommentsByDeleteChange(
  change: vscode.TextDocumentContentChangeEvent,
  commentsInDocument: Comment[]
): Comment[] {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];
  for (const comment of commentsInDocument) {
    // 2.1 If the change is in the comment.
    if (
      change.range.start.line >= comment.start.line &&
      change.range.end.line <= comment.end.line
    ) {
      // 2.2 If the deleted content is not the whole comment, return the comment.
      if (comment.text.length > change.text.length) {
        result.push(comment);
        break;
      }
    }
  }

  // 3. Return the result.
  return result;
}

/**
 * Update the diagnostics in the affected comments.
 */
const updateDiagnosticInChangedComments = (
  document: vscode.TextDocument,
  affectedComments: Comment[]
): void => {
  // 1. Handling input.
  // 2. Processing logic.
  vscode.commands.executeCommand(checkCommandIdentifier, affectedComments);
  // 3. return the result.
};
