import "dotenv/config";

// The endpoint url for accessing the API of the language model.
export const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// The model id of the language model.
export const MODEL_ID = "glm-4-flash";
// export const MODEL_ID = "glm-4";

/**
 * Get the secret key from the configuration variables that are provided by the user.
 * @returns The secret key.
 */
export const getSecretKey = (): string => {
  let { SECRET_KEY } = process.env;

  if (process.env.NODE_ENV !== "test") {
    // Access the config variables from the settings.json file.
    const vscode = require("vscode") as typeof import("vscode");
    const config = vscode.workspace.getConfiguration("grammarChecker");
    const modelSecretKey = config.get<string>("modelSecretKey");
    SECRET_KEY = SECRET_KEY || modelSecretKey;
  }

  return SECRET_KEY || "";
};

/**
 * The following constants are used to identify the source of the diagnostics. and the code action will be created based on the itentified diagnostics.
 */
export const diagnosticSource = "GrammarChecker";
export const diagnosticCode = diagnosticSource;
