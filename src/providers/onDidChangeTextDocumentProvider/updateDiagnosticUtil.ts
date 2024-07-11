import * as vscode from "vscode";
import { DiagnasticStore } from "../../store/diagnasticStore";
import { diagnosticCollection } from "../../diagnosticCollection/diagnosticCollection";
import { debounce } from "@wuchuhengtools/helper";
import LogUtil from "../../utils/logUtil";

/**
 * Get the changed type of the text document content change event.
 * @param change
 * @returns
 */
export const getChangedType = (
  change: vscode.TextDocumentContentChangeEvent
): "insert" | "delete" | "replace" => {
  // 1. Handling input.
  // 2. Process logic.
  // 2.1 If the length of the text is empty, but the range length is not empty, return "delete".
  if (change.text === "" && change.rangeLength > 0) {
    return "delete";
  }

  // 2.2 If the length of the text is not empty, but the range length is empty, return "insert".
  if (change.text !== "" && change.rangeLength === 0) {
    return "insert";
  }

  // 2.3 If the length of the text is not empty, and the range length is not empty, return "replace".
  if (change.text !== "" && change.rangeLength > 0) {
    return "replace";
  }

  // 3. Return result.
  throw new Error("Invalid change type");
};

export const getAdjustedDiagnostics = (
  event: vscode.TextDocumentChangeEvent
): vscode.Diagnostic[] => {
  // 1. Handling input.
  // 2. Process logic: Adjust diagnostics based on document changes
  const changes = event.contentChanges;
  const diagnostics = diagnosticCollection.get(event.document.uri) || [];
  const newDiagnostics: vscode.Diagnostic[] = diagnostics.map((diagnostic) => {
    for (const change of changes) {
      const range = change.range;
      // 2.1 If the diagnostic is placed before the change, no need to adjust.
      if (range.start.isAfter(diagnostic.range.end)) {
        continue;
      }

      // 2.2 If the diagnostic is placed after the change, adjust the start and end.
      const text = change.text;
      const changedTextLines = text.split("\n");
      let lastChangedTextLine = changedTextLines[changedTextLines.length - 1];
      // 2.2.1 Get the last text line length.
      let lastTextLineLength = 0;
      const changedType = getChangedType(change);
      switch (changedType) {
        case "insert":
          lastTextLineLength = lastChangedTextLine.length;
          break;
        case "delete":
          lastTextLineLength = -change.rangeLength;
          break;
        case "replace":
          lastTextLineLength = lastChangedTextLine.length - change.rangeLength;
          break;
      }

      // 2.2.2 If the change is before the diagnostic range, adjust the start and end.
      if (range.end.isBefore(diagnostic.range.start)) {
        // Change before the diagnostic range, adjust start and end
        const lineDelta =
          text.split("\n").length - 1 - (range.end.line - range.start.line);
        const charDelta =
          change.range.end.line === diagnostic.range.start.line &&
          changedType === "insert"
            ? lastTextLineLength
            : 0;
        diagnostic.range = new vscode.Range(
          diagnostic.range.start.translate(lineDelta, charDelta),
          diagnostic.range.end.translate(lineDelta, charDelta)
        );
      } else if (range.end.isEqual(diagnostic.range.start)) {
        // 2.2.3 If the change is in the same line as the start of the diagnostic range, adjust the start.
        const lineDelta = text.split("\n").length - 1;
        const charDelta = lastTextLineLength;
        const start = diagnostic.range.start.translate(lineDelta, charDelta);
        const end = diagnostic.range.end.translate(lineDelta, charDelta);
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
  return newDiagnostics;
};

/**
 * Compare the changes between the previous and current changes.
 * @param previouseChanges
 * @param currentChanges
 */
export const isSameChanges = (
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
export const updateHoverInformation = (
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
export const updateDiagnostic = debounce<vscode.TextDocumentChangeEvent>(
  (event) => {
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
  },
  100
);
