import * as vscode from "vscode";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";
import { declarations } from "../../dist/extension";

/**
 * Generate the diagnostic code.
 */
let diagnosticCode: number = 1;
export const generateCode = () => diagnosticCode++;

let setDiagnosticsTimer: NodeJS.Timeout | null = null;

/**
 *
 */
export const reloadDiagnosticCollection = (
  uri: vscode.Uri,
  diagnostics: vscode.Diagnostic[]
): void => {
  // 1. Handling input.
  // 2. Processing logic.
  // 2.1 If the diagnostic collection already exists, delete it.
  const isExist = diagnosticCollection.has(uri);
  if (isExist) {
    diagnosticCollection.delete(uri);
  }

  // 2.2 Set the diagnostics.
  const setDiagnostics = () => diagnosticCollection.set(uri, diagnostics);
  if (isExist) {
    setDiagnosticsTimer && clearTimeout(setDiagnosticsTimer);
    setDiagnosticsTimer = setTimeout(() => {
      setDiagnostics();
      setDiagnosticsTimer = null;
    }, 100);
  } else {
    setDiagnostics();
  }

  // 3. Return the result.
};
