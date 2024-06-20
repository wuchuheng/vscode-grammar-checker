import "dotenv/config";
import axios from "axios";
import { prompt, promptInEnglish, promptStep1 } from "./prompt";

/**
 * Represents the response type returned by the AI client.
 */
type ResponseItemType = {
  id: number;
  items: {
    range: {
      start: number;
      end: number;
    };
    replacement: string;
  }[];
};
type ResponseType = ResponseItemType[];
export default ResponseType;

/**
 * Defines the structure for input data to be processed by an AI system. This type is particularly used for representing
 * a collection of text items contained within a single file, where each item is identified and processed individually.
 */
export type InputType = {
  fileName: string;
  items: {
    id: number;
    content: string;
  }[];
};

//  Get the bot base URL, token, and ID from environment variables
const { SECRET_KEY, API_URL, MODEL_ID } = process.env;

/**
 * Calls the OpenAI API to generate completions based on user and assistant prompts.
 * @param input The input to be sent to the OpenAI API.
 * @returns A promise that resolves to an array of response objects.
 */
export const aiClient = async (input: InputType): Promise<ResponseType> => {
  // 1. Create a request to the OpenAI API
  const inputJson = JSON.stringify(input);
  const response = await axios.post(
    `${API_URL}`,
    {
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: promptInEnglish,
        },
        { role: "user", content: inputJson },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET_KEY}`,
      },
    }
  );

  // 2. Parse the response from the OpenAI API
  let contentJson: string = response.data.choices[0].message.content;
  // 2.1 If the contentJson starts with the character '```json`, remove it
  if (contentJson.startsWith("```json")) {
    contentJson = contentJson.substring(7, contentJson.length - 3);
  }
  // 2.2 If the contentJson ends with the character '```', remove it
  if (contentJson.endsWith("```")) {
    contentJson = contentJson.substring(0, contentJson.length - 3);
  }
  const message = JSON.parse(contentJson) as ResponseType;

  return message;
};

export const step1 = async (input: InputType): Promise<ResponseType> => {
  let prompt = `
  fileName: ${input.fileName}
  `;
  input.items.forEach((item) => {
    prompt += `
    id: ${item.id}
    content:
    ${item.content}
    `;
  });

  // 1. Create post request to the OpenAI API
  const response = await axios.post(
    `${API_URL}`,
    {
      model: MODEL_ID,
      messages: [
        {
          role: "assistant",
          content: promptStep1,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET_KEY}`,
      },
    }
  );

  // 2. Parse the response from the OpenAI API
  let content: string = response.data.choices[0].message.content;
  // 2.1 If the \n character is at the beginning of the content or the end of the content, remove it
  content = content.trim();

  // 3. Convert the string of the content to ResponseType
  // 3.1 The content like this:
  // ```text
  //id: {id}
  // - range: {start}-{end} word: {word} -> {correctedWord}
  // - range: {start}-{end} word: {word} -> {correctedWord}
  // ...
  // id: {id}
  // ...
  const result: ResponseType = [];
  let item: ResponseItemType = { id: -1, items: [] };
  for (let line of content.split("\n")) {
    // 3.2 If the line starts with 'id:', then create a new item
    if (line.startsWith("id:")) {
      const id = parseInt(line.split(":")[1]);
      // 3.2.1 If the item is not empty, add it to the result
      if (item.id !== -1) {
        result.push(item);
      }
      item = { id, items: [] };
      continue;
    }
    // 3.3 If the line starts with '- range:', then add the range and replacement to the item
    // the line: like 'range: {start}-{end} word: {word} -> {correctedWord}'
    if (line.startsWith("range:")) {
      // 3.3.1 Capture the range, word, and corrected word by using the regular expression
      const regexPattern = /range: (\d+)-(\d+) word: (.*) -> (.*)/;
      const match = line.match(regexPattern);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const replacement = match[4] === '""' ? "" : match[4];
        item.items.push({ range: { start, end }, replacement });
      }
    }
  }
  item.id !== -1 && result.push(item);

  return result;
};
