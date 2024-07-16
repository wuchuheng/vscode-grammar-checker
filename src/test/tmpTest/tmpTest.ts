import { runTests } from "@vscode/test-electron";
import path from "path";

async function go() {
  try {
    const tmpDevelopmentPath = path.resolve(__dirname, "../../../");
    const tmpExtensionTestsPath = path.resolve(__dirname, "./");
    const tmpWorkspacePath = tmpDevelopmentPath;

    await runTests({
      extensionDevelopmentPath: tmpDevelopmentPath,
      extensionTestsPath: tmpExtensionTestsPath,
      launchArgs: [tmpWorkspacePath],
    });
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

go();
