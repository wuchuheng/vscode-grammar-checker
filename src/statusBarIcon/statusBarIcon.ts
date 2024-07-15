import * as vscode from "vscode";
import { checkCommandIdentifier } from "../config/config";
// Create a new status bar item
export const statusBarIcon = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);

const text = `$(check) Grammar`;
// Set text to display an icon and text
statusBarIcon.text = text;

// Set a tooltip
statusBarIcon.tooltip = "Grammar Check is Active";

// Optionally, set a command to execute on click
statusBarIcon.command = checkCommandIdentifier;
statusBarIcon.show();

/**
 * Set the status bar icon to "loading" when the extension is checking the grammar.
 */
export const setIconStatus = (isLoading: "loading" | "ready") => {
  // 2. Processing logic
  if (isLoading === "loading") {
    statusBarIcon.text = `$(sync~spin) Grammar`;
    return;
  } else {
    statusBarIcon.text = text;
  }
};
