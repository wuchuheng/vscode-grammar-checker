import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import AiRequest from "../../utils/aiClient";
import { grammarCheckPrompt } from "../../prompts/typescriptPrompt";
import { removeCodeFormatting } from "../../utils/markdownUtil";

/**
 * Check if a string is a valid grammar in english.
 */
export const isGrammarCorrect = async (data: string): Promise<boolean> => {
  // 1. Input handling
  // 2. Processing Logic
  // 2.1 Build the request data for the OpenAI API.
  const messages: Array<ChatCompletionMessageParam> = [
    { role: "assistant", content: grammarCheckPrompt },
    { role: "user", content: "```\n" + data + "\n```" },
  ];
  // 2.2 Send the request to the OpenAI API.
  const res = await AiRequest(messages);

  // 2.2 Remove the code formatting from the response.
  let content = removeCodeFormatting(res);

  // 2.3 Convert the letter to lowercase.
  content = content.toLowerCase();

  // 2.4 If the content is not `yes` or `no`, throw an error.
  if (content !== "yes" && content !== "no") {
    throw new Error("Invalid response from the OpenAI API.");
  }

  // 2.5 Create the result.
  const result = content === "yes";

  // 3. Return the result.
  return result;
};
