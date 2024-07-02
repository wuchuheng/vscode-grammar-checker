import * as vscode from "vscode";
import { getEdition } from "../store/store";

function escapeMarkdown(inputText: string): string {
  let result: string = inputText;
  // Escaping backslashes first is important to avoid double escaping later
  result = result.replaceAll("\\", "\\\\");
  // Now escape other characters that have special meanings in Markdown
  result = result
    .replaceAll("`", "\\`")
    .replaceAll("*", "\\*")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("#", "\\#")
    .replaceAll("+", "\\+")
    .replaceAll("-", "\\-")
    .replaceAll(".", "\\.")
    .replaceAll("!", "\\!");
  // Spaces are not typically escaped in Markdown, so this line might not be necessary
  // unless you have a specific need to convert spaces to HTML non-breaking spaces
  result = result.replaceAll(" ", "&nbsp;");
  return result;
}

export class HoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // 1. Handling input.
    // 2. Progressing Logic.
    const { edition, comment, range } = getEdition(
      document.fileName,
      position
    )!;

    // 2.1 Specify a pefect title in the panal when the diagnostic is hovered.
    let title = "";
    switch (edition.type) {
      case "insert":
        title = "Insert the missing word";
        break;
      case "delete":
        title = "Remove the incorrect word";
        break;

      case "modify":
        title = "Change the spelling";
        break;
    }

    // 2.2 Create a detailed message for the hover.
    let message = comment.text;
    const startPart = message.substring(0, edition.sourceCharIndex);
    const endPart = message.substring(edition.sourceCharToIndex);
    const toWord = escapeMarkdown(edition.toWord);
    const fromWord = escapeMarkdown(edition.fromWord);
    const modifiedWord = `<span style="color:#F00;">**${toWord}**</span>`;
    const deletedWord = `<span style="color:#F00;">~~**${fromWord}**~~</span>`;
    const insertedWord = `<span style="color:#F00;">**${toWord}**</span>`;
    switch (edition.type) {
      case "modify":
        message = `${startPart}${modifiedWord}${endPart}`;
        break;
      case "delete":
        message = `${startPart}${deletedWord}${endPart}`;
        break;
      case "insert":
        message = `${startPart}${insertedWord}${endPart}`;
        break;
    }

    // 2.3 Convert the \n to <space><space>\n to show the new line in markdown.
    message = message.replace(/\n/g, "  \n");

    const markdownBuilder = new vscode.MarkdownString();
    const markdownString = `**${title}**

${message}`;
    console.log(markdownString);

    markdownBuilder.appendMarkdown(markdownString);
    markdownBuilder.isTrusted = true;

    const result = new vscode.Hover(markdownBuilder, range);
    // 3. Return result.

    return result;
  }
}
