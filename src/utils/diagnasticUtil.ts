import * as vscode from "vscode";

export const generateDiagnosticCode = (range: vscode.Range): string => {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
};

export const decodeDiagnosticCode = (code: string): vscode.Range => {
  const [start, end] = code.split("-");
  const [startLine, startCharacter] = start.split(":");
  const [endLine, endCharacter] = end.split(":");
  const result = new vscode.Range(
    new vscode.Position(Number(startLine), Number(startCharacter)),
    new vscode.Position(Number(endLine), Number(endCharacter))
  );

  return result;
};
