import * as vscode from "vscode";
import { DiagnosticStore } from "../store/diagnosticStore";

function escapeMarkdown(inputText: string): string {
  let result: string = inputText;
  // Escaping backslashes first is important to avoid double escaping later.
  result = result.replace(/\\/g, "\\\\");
  // Now escape other characters that have special meanings in Markdown.
  result = result
    .replace("`", "\\`")
    .replace("*", "\\*")
    .replace("_", "\\_")
    .replace("{", "\\{")
    .replace("}", "\\}")
    .replace("[", "\\[")
    .replace("]", "\\]")
    .replace("(", "\\(")
    .replace(")", "\\)")
    .replace("#", "\\#")
    .replace("+", "\\+")
    .replace("-", "\\-")
    .replace(".", "\\.")
    .replace("!", "\\!");
  // Spaces are not typically escaped in Markdown, so this line might not be necessary.
  // unless you have a specific need to convert spaces to HTML non-breaking spaces
  result = result.replace(" ", "&nbsp;");
  return result;
}

export class HoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // 1. Handling input.
    // 2. Progressing logic.
    // 2.1 Find a hovered diagnostic.
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    // Filter diagnostics to find those that include the hovered position.
    const hoveredDiagnostic = diagnostics.find((diagnostic) =>
      diagnostic.range.contains(position)
    );
    // 2.1.1 If there is no diagnostic at the hovered position, return early.
    if (!hoveredDiagnostic) {
      return;
    }

    // 2.2 Get the hover information from the diagnostic store.
    const {
      edition,
      comment,
      diagnostic: { range },
    } = DiagnosticStore.get({
      fileName: document.fileName,
      id: hoveredDiagnostic.code as number,
    });

    // 2.1 Specify a perfect title in the panel when the diagnostic is hovered.
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
    const startPart = message.substring(0, edition.chartIndex);
    const endPart = message.substring(edition.toChartIndex);
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
