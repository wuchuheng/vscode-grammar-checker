import { TextDocument, TextDocumentChangeEvent } from "vscode";
import LanguageAdapterInterface, {
  RequestData,
} from "../languageAdapter.interface";
import { Comment } from "../../utils/diagnosticUtil";

export default class DartAdapter implements LanguageAdapterInterface {
  supportedLanguageId: string[] = ["dart"];
  extractComments(document: TextDocument): Comment[] {
    throw new Error("Method not implemented.");
  }
  onDidChangeTextDocument(event: TextDocumentChangeEvent): Comment[] {
    throw new Error("Method not implemented.");
  }
  middlewareHandle(args: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string[]>;
  }): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
}
