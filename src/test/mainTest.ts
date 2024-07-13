import { runTests } from "@vscode/test-electron";
import path from "path";

async function go() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/");
    const workspacePath = extensionDevelopmentPath;

    /**
     * Basic usage
     */
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      // Set the path to the workspace file.
      launchArgs: [workspacePath],
    });
    console.log("Tests passed");
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

go();
