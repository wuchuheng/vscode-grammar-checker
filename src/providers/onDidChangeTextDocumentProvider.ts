import { debounce } from "@wuchuhengtools/helper";
import * as vscode from "vscode";
import LogUtil from "../utils/logUtil";
import { DiagnasticStore } from "../store/diagnasticStore";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";

const getAdjustedDiagnostics = (
  event: vscode.TextDocumentChangeEvent
): vscode.Diagnostic[] => {
  // 1. Handling input.
  // 2. Process logic.
  // 2.1 Adjust diagnostics based on document changes
  const changes = event.contentChanges;

  let diagnostics = vscode.languages.getDiagnostics(event.document.uri) || [];
  diagnostics = diagnostics.map((diagnostic) => {
    for (const change of changes) {
      const range = change.range;
      if (range.start.isAfter(diagnostic.range.end)) {
        // Change after the diagnostic range, no need to adjust
        continue;
      }
      const text = change.text;
      if (range.end.isBefore(diagnostic.range.start)) {
        // Change before the diagnostic range, adjust start and end
        const lineDelta =
          text.split("\n").length - 1 - (range.end.line - range.start.line);
        diagnostic.range = new vscode.Range(
          diagnostic.range.start.translate(lineDelta),
          diagnostic.range.end.translate(lineDelta)
        );
      } else if (range.end.isEqual(diagnostic.range.start)) {
        // Change ends at the start of the diagnostic range, adjust start
        const lineDelta = text.split("\n").length - 1;
        const charDelta = text.split("\n").pop()!.length;
        const start = diagnostic.range.start.translate(lineDelta, charDelta);
        const end = diagnostic.range.end.translate(lineDelta);
        diagnostic.range = new vscode.Range(start, end);
      } else if (range.intersection(diagnostic.range)) {
        // Change intersects with the diagnostic range, adjust or invalidate diagnostic
        const newRange = new vscode.Range(
          diagnostic.range.start,
          diagnostic.range.end
        );
        diagnostic.range = newRange;
      }
    }
    return diagnostic;
  });

  // 3. Return result.
  return diagnostics;
};

/**
 * Compare the changes between the previous and current changes.
 * @param previouseChanges
 * @param currentChanges
 */
const isSameChanges = (
  previouseChanges: readonly vscode.TextDocumentContentChangeEvent[],
  currentChanges: readonly vscode.TextDocumentContentChangeEvent[]
): boolean => {
  // 1. Handling input.
  // 2. Process logic.
  // 2.1 If the length of the previous changes is not equal to the length of the current changes, return false.
  if (previouseChanges.length !== currentChanges.length) {
    return false;
  }

  // 2.1 Compare each change.
  for (const [index, previouseChange] of previouseChanges.entries()) {
    // 2.1.1 If the range of the previous change is not equal to the range of the current change, return false.
    if (!previouseChange.range.isEqual(currentChanges[index].range)) {
      return false;
    }

    // 2.1.2 If the text of the previous change is not equal to the text of the current change, return false.
    if (previouseChange.text !== currentChanges[index].text) {
      return false;
    }
  }

  // 3. Return result.
  return true;
};

/**
 * Update the hover information with the new diagnostics.
 */
const updateHoverInformation = (
  fileName: string,
  newDiagnostics: vscode.Diagnostic[]
): void => {
  // 1. Handling input.
  // 2. Process logic.
  // 2.1 Get the list of diagnostics from the store and build the new values.
  const newValues = newDiagnostics.map((value) => {
    const newItem = DiagnasticStore.get({ fileName, id: value.code as number });
    newItem.diagnostic = value;
    return newItem;
  });

  // 2.2 Clear the old values.
  DiagnasticStore.clear(fileName);

  // 2.3 Set the new values.
  newValues.forEach((value) => {
    DiagnasticStore.set({
      fileName,
      id: value.diagnostic.code as number,
      value,
    });
  });

  // 3. Return result.
};

let previousChanges: readonly vscode.TextDocumentContentChangeEvent[] = [];
export const onDidChangeTextDocumentProvider = (
  event: vscode.TextDocumentChangeEvent
) => {
  const debounceHandler = debounce<void>(() => {
    // 1. Handling input.

    // 2. Process logic.
    // 2.1 If the changes are the same, return.
    if (
      isSameChanges(previousChanges, event.contentChanges) ||
      event.contentChanges.length === 0
    ) {
      return;
    } else {
      previousChanges = event.contentChanges;
    }

    // 2.2 Get the adjusted diagnostics.
    const newDiagnostics = getAdjustedDiagnostics(event);

    // 2.3 Update hover information with the new diagnostics.
    updateHoverInformation(event.document.fileName, newDiagnostics);

    // 2.3 Update the diagnostic collection.
    diagnosticCollection.delete(event.document.uri);
    diagnosticCollection.set(event.document.uri, newDiagnostics);

    // 2.4 Log.
    newDiagnostics.forEach((item) => {
      const { range } = item;
      LogUtil.debug(
        `Update diagnostic: 
startLine: ${range.start.line}, startCharacter: ${range.start.character}, 
endLine: ${range.end.line}, endCharacter: ${range.end.character}`
      );
    });
  }, 300);

  debounceHandler();
};
