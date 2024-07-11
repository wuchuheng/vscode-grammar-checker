# Contributing to This Project

Thank you for your interest in contributing to this project! We value your contributions and want to make sure that your experience is as enjoyable and productive as possible. Here are some guidelines that we ask contributors to follow.

## 1 Getting Started

- Make sure you have a [GitHub account](https://github.com/signup).
- Check the [issues page](https://github.com/wuchuheng/vscode-grammar-checker/issues) for existing issues or create a new one where you can discuss your proposed changes.
- Fork the repository on GitHub.
- Clone the forked repository to your local machine.
- Install the project dependencies by running `pnpm install` in the project directory.
- Configure the project to run on your local machine. you have to the following steps:
  - Copy the `.env.example` file to `.env` file in the root directory. and then fill in the necessary information.
  - Copy the `src/test/workspaceForTest/.vscode/settings.json.example` file to `src/test/workspaceForTest/.vscode/settings.json` file in the root directory. and then fill in the necessary information.
- In final, you can run the project by pressing `F5` in the vscode.

## 2 Adding a new adapter to support a new language

For example, if you want to add a new adapter to support the `markdown` language, you can follow the steps below:

### 2.1 Create a new adapter.

Create a new file named `src/adapters/markdownAdapter/markdownAdapter.ts`. and the adapter must implement the `Adapter` interface. like:

```typescript
import { TextDocument } from "vscode";
import LanguageAdapterInterface, {
  RequestData,
} from "../languageAdapter.interface";
import { Comment } from "../typescriptAdapter/typescriptUtil";

export default class MarkdownAdapter implements LanguageAdapterInterface {
  // The language id that you want to support
  supertedLanguageId: string[] = ["markdown"];

  // The method to extract comments from the document, the return value will be used to send to the OpenAI API.
  extractComments(document: TextDocument): Comment[] {
    throw new Error("Method not implemented.");
  }

  // The method to send the request to OpenAI API with the request data
  middlewareHandle(args: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string>;
  }): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
```

### 2.2 Register the adapter in the `src/config.ts` file.

```typescript
/**
 * The list of language adapters that are used to correct the comments in the supported programming languages.
 */
export const adapterList: LanguageAdapterInterface[] = [
  new TypescriptAdapter(),
  new MarkdownAdapter(),
  ...
];
```

### 2.3 Configure the `package.json` file.

```json
{
  ...
    "activationEvents": [
      ...
    "onLanguage:markdown"
  ],
  "contributes": {
    "diagnostics": {
      "languages": [
        ...
        "markdown"
      ],
      "documentSelector": [
        ...
        "markdown"
      ]
    },
}
```

## 3 Making Changes

- Create a new branch from where you want to base your work (usually from the main branch).
  - Name your branch something descriptive, e.g., `fix-issue-123` or `feature-add-cool-feature`.
- Make your changes in your forked repository.
- Write or adapt tests as needed.
- Ensure that your code adheres to the existing style of the project to maintain consistency.
- Make commits of logical and manageable sizes. Write meaningful commit messages.
- Push your changes to your fork on GitHub.

## 4 Submitting Changes

- Submit a pull request to the original repository.
- Include a clear description of the changes and any relevant issue numbers.
- Wait for feedback or approval from the project maintainers. Be prepared to make revisions if requested.

## 5 Code Review Process

- Project maintainers will review your pull request and either merge it, request changes, or provide feedback.
- Respect the decision of maintainers. They have the final say on whether or not changes are included.

Thank you for your contributions to this project. Your efforts help make this project better for everyone!
