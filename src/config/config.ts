import "dotenv/config";
import LanguageAdapterInterface from "../adapters/languageAdapter.interface";
import TypescriptAdapter from "../adapters/typescriptAdapter/typescriptAdapter";
import { getApiKeyLogic } from "../utils/configUtil";

// The endpoint url for accessing the API of the language model.
export const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// The model id of the language model.
export const MODEL_ID = "glm-4-flash";
// export const MODEL_ID = "glm-4";

export const apiKeyName = "AiapiKey";

/**
 * Get the secret key from the configuration variables that are provided by the user.
 * @returns The secret key.
 */
export const getSecretKey = async (): Promise<string> => getApiKeyLogic();

/**
 * The following constants are used to identify the source of the diagnostics. and the code action will be created based on the itentified diagnostics.
 */
export const diagnosticName = "GrammarChecker";
export const diagnosticSource = diagnosticName;

/**
 * The following constant is used to identify the command that will be executed when the user clicks on the code action.
 */
export const fixCommandIdentifier = "GrammarChecker.fix";
export const checkCommandIdentifier = "GrammarChecker.check";
export const removedApiKeyCommandIdentifier = "GrammarChecker.removeApiKey";

/**
 * The list of language adapters that are used to correct the comments in the supported programming languages.
 */
export const adapterList: LanguageAdapterInterface[] = [
  new TypescriptAdapter(),
];
