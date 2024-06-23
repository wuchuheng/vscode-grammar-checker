import axios from "axios";
import { InputType } from "../utils/aiClient";
import { correctCommentPrompt } from "../prompts/commentCorrectedPrompt";
import { API_URL, getSecretKey, MODEL_ID } from "../config/config";

/**
 *  Correct the comments by using the AI system
 *
 * @param input
 * @returns
 */
export const correctComments = async (input: InputType): Promise<number[]> => {
  // 1. Input handling

  // 2. Processing Logic
  // 2.1 Create the input data for the AI system
  const itemsInputStr = input.items
    .map((item) => {
      return `
-----BEGIN COMMENT-----
id: ${item.id} 

${item.content}
-----END CONTENT-----
`;
    })
    .join("");

  const userInput = `fileName: ${input.fileName}

${itemsInputStr}`;

  // 2.2. Create post request to the OpenAI API
  // 2.2.1 Get the arguments for the API request.
  const secretKey = getSecretKey();

  // 2.2.3 Send the request to the OpenAI API
  const response = await axios.post(
    `${API_URL}`,
    {
      model: MODEL_ID,
      messages: [
        {
          role: "assistant",
          content: correctCommentPrompt,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
    }
  );
  let content: string = response.data.choices[0].message.content;

  // 2.3 Remove the wrapper of the content in markdown format
  content = content.trim();
  // 2.3.1 If the content start with '```', remove the wrapper
  if (content.startsWith("```")) {
    // regex pattern to remove the wrapper
    const regexPattern = /(```\w{0}).*/;
    const match = content.match(regexPattern);
    const markdownStr = match ? match[0] : "";
    if (markdownStr) {
      content = content.substring(markdownStr.length);
    }
  }

  // 2.3.2 If the content end with '```', remove the wrapper
  content = content.endsWith("```")
    ? content.substring(0, content.length - 3)
    : content;

  console.log(userInput);
  console.log(content);

  // 2.4. Parse the list of ids from the content, the content like this:
  //'correctedIds:
  // -----BEGIN CORRECTED_IDS-----
  // 1
  // 2
  // -----END CORRECTED_REPORT-----'
  // 2.4.1 Capture the ids by using the regular expression
  const idsRegexPattern =
    /correctedIds:\n-----BEGIN CORRECTED_REPORT-----\n([\s\S]*)\n-----END CORRECTED_REPORT-----/;
  const match = content.match(idsRegexPattern);
  const idsStr = match ? match[1] : "";
  // 2.4.2 Convert the string of ids to number array
  const ids = idsStr.split("\n").map((id) => parseInt(id));

  // 3. Output handling
  return ids;
};
