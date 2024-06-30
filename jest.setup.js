jest.mock(
  "vscode",
  () => {
    return {
      // Mock properties and methods of the vscode module as needed for your tests
      Uri: { parse: jest.fn() },
      // Add more mocks as per your test requirements
    };
  },
  { virtual: true }
);
