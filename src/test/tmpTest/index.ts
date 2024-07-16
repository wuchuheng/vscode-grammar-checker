import * as path from "path";
import Mocha from "mocha";

export function run(
  testsRoot: string,
  cb: (error: any, failures?: number) => void
): void {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    timeout: 60 * 1000,
  });

  const files: string[] = [
    "../../adapters/dartAdapter/dartAdapter.test/dartAdapter.test.js",
  ].map((f) => path.resolve(testsRoot, f));

  // Add files to the test suite
  files.forEach((f) => {
    const file = path.resolve(testsRoot, f);
    mocha.addFile(file);
  });

  try {
    // Run the mocha test
    mocha.run((failures) => {
      cb(null, failures);
    });
  } catch (err) {
    console.error(err);
    cb(err);
  }
}
