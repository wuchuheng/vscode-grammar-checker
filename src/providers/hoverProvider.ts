import * as vscode from "vscode";

export class HoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, /helo/);
    if (range) {
      const markdownString = new vscode.MarkdownString();
      markdownString.appendMarkdown(
        `**Change the verb form**

The plural verb 
**are**
 does not appear to agree with the singular subject 
**This**
. Consider changing the verb form for subject-verb agreement.


… This 
<span style="color:#F00;">~~are~~</span>
is …`
      );
      markdownString.isTrusted = true;
      return new vscode.Hover(markdownString, range);
    }
    return null;
  }
}
