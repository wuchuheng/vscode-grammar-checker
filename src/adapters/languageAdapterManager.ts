import LanguageAdapterInterface from "./languageAdapter.interface";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { adapterList } from "../config/config";

/**
 * The LanguageAdapterManager class is responsible for managing the language adapters.
 */
export default class LanguageAdapterManager {
  private static _adapters: Map<string, LanguageAdapterInterface> = new Map();
  private static _isInitialized = false;

  /**
   * Initialize the adapter manager.
   *
   * The adapter manager must be initialized before using it.
   * @param context
   */
  public static initialize(context: vscode.ExtensionContext): void {
    // 1. Handling input.
    // 1.1 If the adapter manager is already initialized, throw an error.
    if (this._isInitialized) {
      throw new Error("Adapter manager is already initialized");
    }
    // 2. Processing logic.
    // 2.1 Get the list of activationEvents from the `package.json` file.
    const packageJsonPath = path.join(context.extensionPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const activationEvents = packageJson.activationEvents;

    // 2.2 Convert the activationEvents to a set.
    const activationEventsSet: Set<string> = new Set();
    activationEvents.forEach((event: string) => {
      // Get the language ID from the activation event, like: onLanguage:typescript, and then capture the language ID named typescript.
      const languageId = event.split(":")[1];
      activationEventsSet.add(languageId);
    });

    // 2.3 Check the adapter list is right.
    adapterList.forEach((adapter) => {
      const languageIds = adapter.supportedLanguageId;
      languageIds.forEach((id) =>
        LanguageAdapterManager.registerAdapter(id, adapter)
      );
    });

    this._isInitialized = true;
    // 3. Return result.
  }

  /**
   * Register an adapter to the manager.
   * @param languageId
   * @param adapter
   */
  public static registerAdapter(
    languageId: string,
    adapter: LanguageAdapterInterface
  ): void {
    // 1. Handling input.
    // 1.1 Validate input.
    // 1.1.1 If the ID is empty, throw an error.
    if (languageId === "") {
      throw new Error("languageId cannot be empty");
    }
    // 1.1.2 If the key already exists, throw an error.
    if (this._adapters.has(languageId)) {
      throw new Error("Adapter already exists");
    }

    // 1.2 Validate that the language ID is set in the field `activationEvents` of the `package.json` file.
    // 1.2.1 Get the package.json file.
    // TODO: Implement the logic to get the package.json file.

    // 2. Processing logic.
    this._adapters.set(languageId, adapter);
    // 3. Return result.
  }

  /**
   * Check if the adapter exists.
   * @param languageId
   * @returns
   */
  static has(languageId: string): boolean {
    return this._adapters.has(languageId);
  }

  /**
   * Get the adapter for the specific language.
   */
  public static getAdapter(languageId: string): LanguageAdapterInterface {
    // 1. Handling input.
    // 1.1 Validate input.
    // 1.1.1 If the ID is not empty, throw an error.
    if (languageId === "") {
      throw new Error("languageId cannot be empty");
    }

    // 1.1.2 If the key does not exist, throw an error.
    if (!this._adapters.has(languageId)) {
      throw new Error(`Adapter: ${languageId} does not exist`);
    }

    // 2. Processing logic.
    const result: LanguageAdapterInterface = this._adapters.get(languageId)!;

    // 3. Return result.

    return result;
  }

  /**
   * Get the list of language IDs.
   */
  public static get languageIds(): string[] {
    // 1. Processing logic.
    const result = Array.from(this._adapters.keys());

    // 2. Return result.
    return result;
  }
}
