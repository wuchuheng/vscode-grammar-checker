module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/*.ai.test.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  moduleDirectories: ["node_modules", "src"],
  modulePathIgnorePatterns: [
    "<rootDir>/.vscode-test/vscode-darwin-arm64-1.90.1",
    "<rootDir>/.vscode-test/vscode-darwin-arm64-1.90.2",
  ],
};

process.env.NODE_ENV = "test";
