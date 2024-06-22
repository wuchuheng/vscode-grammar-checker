import axios from "axios";
import { InputType } from "../utils/aiClient";
import { filterPrompt } from "../prompts/commentsFilterPrompt";
import { API_URL, getSecretKey, MODEL_ID } from "../config/config";

/**
 *  Filter the comments by using the AI system
 *
 * If the comment is incorrect within the input, and then the AI will be extracted the coresponding id of the comment and return the list of ids.
 * @param input
 * @returns
 */
export const commentsFilter = async (input: InputType): Promise<number[]> => {
  // 1. Input handling

  // 2. Processing Logic
  // 2.1 Create the input data for the AI system
  const itemsInputStr = input.items
    .map((item) => {
      return `id: ${item.id}
content:
-----BEGIN CONTENT-----
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
          content: filterPrompt,
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
  const content: string = response.data.choices[0].message.content;

  // 2.3. Parse the list of ids from the content, the content like this:
  //'correctedIds:
  // -----BEGIN CORRECTED_IDS-----
  // 1
  // 2
  // -----END CORRECTED_IDS-----'
  // 2.3.1 Capture the ids by using the regular expression
  const idsRegexPattern =
    /correctedIds:\n-----BEGIN CORRECTED_IDS-----\n([\s\S]*)\n-----END CORRECTED_IDS-----/;
  const match = content.match(idsRegexPattern);
  const idsStr = match ? match[1] : "";
  // 2.3.2 Convert the string of ids to number array
  const ids = idsStr.split("\n").map((id) => parseInt(id));

  // 3. Output handling
  return ids;
};
