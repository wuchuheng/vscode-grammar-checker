import * as vscode from "vscode";
import { apiKeyName, removedApiKeyCommandIdentifier } from "../config/config";
import { ChangedOperation } from "../utils/compareSentenceUtil";
import { getContext } from "../store/contextStore";
import { Comment } from "../utils/diagnosticUtil";

export type CommentBindEdition = {
  comment: Comment;
  editions: ChangedOperation[];
};

/**
 * Registers the "GrammarChecker.fix" command.
 */
export const removedApiKeyCommand = vscode.commands.registerCommand(
  removedApiKeyCommandIdentifier,
  (): void => {
    // 1. Handling input.
    // 2. Processing logic.
    const context = getContext();
    context.globalState.update(apiKeyName, "");
    vscode.window.showInformationMessage("The API key removed successfully 🎉");

    // 3. Return the result.
  }
);
