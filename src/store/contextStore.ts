import * as vscode from "vscode";
let context: vscode.ExtensionContext;

export const setContext = (newContext: vscode.ExtensionContext) =>
  (context = newContext);

export const getContext = (): vscode.ExtensionContext => {
  if (!context) {
    throw new Error("Context is not set.");
  }
  return context;
};
