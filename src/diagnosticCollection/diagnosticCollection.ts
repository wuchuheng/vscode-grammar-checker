import * as vscode from "vscode";
import { diagnosticName } from "../config/config";
export const diagnosticCollection =
  vscode.languages.createDiagnosticCollection(diagnosticName);
