const path = require("path");
module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testMatch: ["**/src/test/jest/**/*.test.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  // Add the testPathIgnorePatterns option here
  moduleDirectories: ["node_modules", "src"],
  modulePathIgnorePatterns: [
    "<rootDir>/.vscode-test/vscode-darwin-arm64-1.90.1",
    "<rootDir>/.vscode-test/vscode-darwin-arm64-1.90.2",
  ],
  testEnvironment: "node", // or 'jsdom' or a custom environment
  setupFilesAfterEnv: [path.resolve(__dirname, "jest.setup.js")],
};

process.env.NODE_ENV = "test";
