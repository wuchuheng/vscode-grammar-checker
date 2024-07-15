export const removeCodeFormatting = (inputText: string) => {
  // 1. Input handling.
  // 1.1 If the character "```" is not present in the input text, return the input text.
  if (!inputText.includes("```")) {
    return inputText;
  }

  // 2. Processing Logic.
  // 2.1 Remove the code formatting.
  let result = inputText.trim();
  // 2.2 If the input text is starting with "```", remove it.
  if (result.startsWith("```")) {
    result = result.slice(3);
  }
  // 2.3 If the input text is ending with "```", remove it.
  if (result.endsWith("```")) {
    result = result.slice(0, -3);
  }

  // 3. Return the result.

  return result;
};
