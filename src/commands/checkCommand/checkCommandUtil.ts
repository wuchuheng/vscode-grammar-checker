import * as vscode from "vscode";
import LanguageAdapterManager from "../../adapters/languageAdapterManager";
import { Comment } from "../../adapters/typescriptAdapter/typescriptUtil";
import LanguageAdapterInterface from "../../adapters/languageAdapter.interface";
import { DiagnasticStore, HoverInformation } from "../../store/diagnasticStore";
import { CommentBindEdition } from "./checkCommand";
import { translateEditionToRange } from "../../utils/vscodeUtils";
import { diagnosticSource } from "../../config/config";
import { generateCode } from "../../utils/diagnasticUtil";

/**
 *  Get the active text document.
 * @returns
 */
export const getDocument = (): vscode.TextDocument => {
  // 2. Processing logic.
  const editor = vscode.window.activeTextEditor!;
  if (!editor) {
    throw new Error("No active text editor found.");
  }
  const document = editor!.document;

  // 3. Return result.
  return document;
};

/**
 * Get the adapter that corresponds to the active text editor.
 */
export const getAdapter = (): LanguageAdapterInterface => {
  const document = getDocument();
  const adapter = LanguageAdapterManager.getAdapter(document.languageId);

  return adapter;
};

/**
 * Get the comments from the active text editor.
 */
export const getComment = (inputComments: Comment[]): Comment[] => {
  const adapter = getAdapter();
  const document = getDocument();
  let comments =
    inputComments.length > 0
      ? inputComments
      : adapter.extractComments(document);

  // 2.1.1 Filter out the empty comments.
  comments = comments.filter((comment) => comment.text.trim() !== "");

  // 3. Return the result.
  return comments;
};

export const setHoverInformation = (
  hoverInformationList: HoverInformation[]
) => {
  // 2. Processing logic.
  const editor = vscode.window.activeTextEditor!;
  const fileName = editor.document.fileName;
  // 2.1 Clear the diagnostic in the store for this file.
  DiagnasticStore.clear(fileName);
  // 2.2 Add the diagnostic to the store.
  hoverInformationList.forEach((item) => {
    DiagnasticStore.set({
      fileName,
      id: item.diagnostic.code as number,
      value: item,
    });
  });
};

/**
 * Build the diagnostics and hover information.
 */
export const buildDiagnosticsAndHoverInformation = (
  commentBindEditions: CommentBindEdition[]
): {
  diagnostics: vscode.Diagnostic[];
  hoverInformationList: HoverInformation[];
} => {
  const diagnostics: vscode.Diagnostic[] = [];
  const hoverInformationList: HoverInformation[] = [];
  commentBindEditions.forEach((commentBindEdition) => {
    commentBindEdition.editions.forEach((edition) => {
      const range = translateEditionToRange(
        commentBindEdition.comment,
        edition
      );

      // 2.4.2 Create the diagnostic.
      commentBindEdition.comment.text;
      edition.chartIndex;
      commentBindEdition.comment.start;
      const diagnostic = new vscode.Diagnostic(
        range,
        "Correct your spelling",
        vscode.DiagnosticSeverity.Warning
      );
      diagnostic.source = diagnosticSource;
      diagnostic.code = generateCode();
      // 2.5 Collect the diagnostics for the step #2.7
      diagnostics.push(diagnostic);

      // 2.6 Collect the hover information for the step #2.8
      hoverInformationList.push({
        edition,
        comment: commentBindEdition.comment,
        diagnostic,
      });
    });
  });

  // 3. Return the result.
  return { diagnostics, hoverInformationList };
};
