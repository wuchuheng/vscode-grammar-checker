import { apiKeyName } from "../config/config";
import { getContext } from "../store/contextStore";
import { getApiKeyFromHtmlPanel } from "./accessAipKeyPanelUtil";

export const getApiKeyLogic = async (): Promise<string> => {
  // 2. Processing logic.

  // 2.1 Access the secret key from the configuration variables.
  let { SECRET_KEY } = process.env;

  // 2.2 If the secret key is not provided in the configuration variables, try to access it from the settings.json file.
  if (!SECRET_KEY && process.env.NODE_ENV !== "test") {
    // Access the config variables from the settings.json file.
    const vscode = require("vscode") as typeof import("vscode");
    const config = vscode.workspace.getConfiguration("grammarChecker");
    const apiKey = config.get<string>("apiKey");
    SECRET_KEY = SECRET_KEY || apiKey;
  }

  // 2.3 If the secret key is empty, prompt the user to enter the secret key.
  if (!SECRET_KEY) {
    const vscode = require("vscode") as typeof import("vscode");
    const context = getContext();
    const hasKey = context.globalState.get(apiKeyName);
    if (!hasKey) {
      SECRET_KEY = await getApiKeyFromHtmlPanel();
      context.globalState.update(apiKeyName, SECRET_KEY);
      vscode.window.showInformationMessage("API Key saved successfully 🎉");
    }
    SECRET_KEY = context.globalState.get(apiKeyName)!; // Retrieve the API key
  }

  return SECRET_KEY!;
};
