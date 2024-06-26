import axios from "axios";
import { correctCommentPrompt } from "../prompts/commentCorrectedPrompt";
import { API_URL, getSecretKey, MODEL_ID } from "../config/config";
import { log } from "console";

/**
 * Correct the traick comment with the standard format
 */
export const correctTrackComment = (content: string): string => {
  // 1. Input handling
  // 1.1 Check if the content isn't started with '/*', then return the content.
  if (!content.startsWith("/*")) {
    return content;
  }

  // 2. Processing Logic.
  // 2.1. Split the content and input by the new line.
  const contentList = content.split("\n");

  // 2.3 Check the first line of the content isn't started with '/** ', then correct it with the standard format.
  const firstLine = contentList[0];
  if (!firstLine.startsWith("/**") && firstLine.startsWith("/*")) {
    contentList[0] = "/**" + firstLine.substring(2);
  }

  // 2.4 Correct the other lines of the content that must be started with '* '.
  for (let i = 0; i < contentList.length; i++) {
    // 2.4.1 If the index is not the first line and not the last line, then correct the line.
    if (i !== 0 && i !== contentList.length - 1) {
      const line = contentList[i];
      if (!line.startsWith("* ")) {
        if (line.startsWith("*")) {
          contentList[i] = "* " + line.substring(1);
        } else {
          contentList[i] = "* " + line;
        }
      }
    }
  }

  // 3. Return the result.
  const result = contentList.join("\n");

  return result;
};

export const correctSingleLineComment = (content: string): string => {
  // 1. Input handling
  // 1.1 Check if the content is started with '/*', then return the content.
  if (content.startsWith("/*")) {
    return content;
  }

  // 2. Processing Logic
  // 2.1 If the content isn't started with '// ', then correct it with the standard format.
  if (!content.startsWith("//")) {
    content = "// " + content;
  }

  // 2.1 If the content is started with '//', but the next character isn't ' ', then correct it with the standard format.
  if (content.startsWith("//") && content.charAt(2) !== " ") {
    content = content.substring(0, 2) + " " + content.substring(2);
  }

  // 3. Return the result

  return content;
};

/**
 *  Correct the comments by using the AI system
 *
 * @param input
 * @returns
 */
export const correctComments = async (input: string): Promise<string> => {
  // 1. Input handling

  // 2. Processing Logic

  // 2.2. Create post request to the OpenAI API
  // 2.2.1 Get the arguments for the API request.
  const secretKey = getSecretKey();

  // 2.2.3 Send the request to the OpenAI API
  let content: string = "";
  let isResponseSuccess: boolean = false;
  let retryCount: number = 0;
  const retryLimit: number = 3;
  while (!isResponseSuccess && retryCount < retryLimit) {
    retryCount++;
    try {
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
              content: input,
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
      content = response.data.choices[0].message.content;
      isResponseSuccess = true;
    } catch (error) {
      if (retryCount === retryLimit) {
        throw error;
      } else {
        log("Retrying the request...");
      }
    }
  }

  // 2.3 Remove the wrapper of the content in markdown format
  content = content.trim();
  // 2.3.1 If the content start with '```', remove the wrapper
  if (content.startsWith("```")) {
    // regex pattern to remove the wrapper
    const regexPattern = /(```\w{0}).*/;
    const match = content.match(regexPattern);
    const markdownStr = match ? match[0] : "";
    if (markdownStr.length > 0) {
      content = content.substring(markdownStr.length);
    }
  }

  // 2.3.2 If the content end with '```', remove the wrapper
  content = content.endsWith("```")
    ? content.substring(0, content.length - 3)
    : content;

  // 2.4 Remove the invalid characters from the content
  const contentList = content.split("\n");
  const inputList = input.split("\n");
  // 2.4.1 If the count of the lines in the content is not equal to the input, then throw an error
  if (contentList.length !== inputList.length) {
    throw new Error(
      "The count of the lines in the content is not equal to the input"
    );
  }

  // 2.5 Format the track comment.
  content = correctTrackComment(content);

  // 2.6 Format the single line comment.
  content = correctSingleLineComment(content);

  return content;
};
