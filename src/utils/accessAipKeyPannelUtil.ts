import * as vscode from "vscode";
import { getContext } from "../store/contextStore";

let isPanelOpen = false;
let pendingTasks: Array<(value: string) => void> = [];
export const getApiKeyFromHtmlPanel = (): Promise<string> => {
  if (isPanelOpen) {
    return new Promise<string>((resolve) => {
      pendingTasks.push(resolve);
    });
  } else {
    isPanelOpen = true;
  }

  const context = getContext();
  return new Promise<string>((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      "apiKeyPrompt",
      "Enter API Key",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "saveApiKey":
            // Resolve the promise with the API key.
            const aipKey = message.apiKey;
            pendingTasks.forEach((task) => task(aipKey));
            pendingTasks = [];
            resolve(aipKey);
            // Close the panel
            panel.dispose();
            return;
          case "openWebsite":
            vscode.env.openExternal(vscode.Uri.parse(message.url));
            return;
        }
      },
      undefined,
      context.subscriptions
    );
  });
};

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enter API Key</title>
</head>
<body align="center">
  <h1>Please enter your API key</h1>
  <input type="text" id="apiKey" placeholder="Enter your API key" required />
  <button id="saveButton">Save API Key</button>
  <button id="openWebsiteButton">Go to Website</button>

  <script>
      const vscode = acquireVsCodeApi();

      document.getElementById('saveButton').addEventListener('click', () => {
          const apiKey = document.getElementById('apiKey').value;
          vscode.postMessage({
              command: 'saveApiKey',
              apiKey: apiKey
          });
      });

      document.getElementById('openWebsiteButton').addEventListener('click', () => {
          vscode.postMessage({
              command: 'openWebsite',
              url: 'https://open.bigmodel.cn/usercenter/apikeys'
          });
      });
  </script>
</body>
</html>`;
}
