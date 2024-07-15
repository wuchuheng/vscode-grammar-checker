import { log } from "console";
import LogUtil from "../../utils/logUtil";
import { RequestData } from "../../adapters/languageAdapter.interface";
import AiRequest from "../../utils/aiClient";

const maximumRetryCount = 3;

/**
 *  Correct the comments by using the AI system
 *
 * @param input
 * @returns
 */
export const correctComments = async (
  requestData: RequestData,
  tryCount: number = 0
): Promise<string[]> => {
  // 1. Input handling

  // 2. Processing Logic

  // 2.2. Create post request to the OpenAI API
  // 2.2.1 Send the request to the OpenAI API
  let content: string = "";
  let isResponseSuccess: boolean = false;
  let retryCount: number = 0;
  const retryLimit: number = 3;
  const data = requestData.data.join("\n");
  while (!isResponseSuccess && retryCount < retryLimit) {
    retryCount++;
    try {
      content = await AiRequest([
        { role: "assistant", content: requestData.prompt },
        {
          role: "user",
          content: `\`\`\`
${data}
\`\`\``,
        },
      ]);
      isResponseSuccess = true;
    } catch (error) {
      if (retryCount === retryLimit) {
        throw error;
      } else {
        log("Retrying the request...");
      }
    }
  }

  // 2.3 Log.
  LogUtil.debug(`AI input: ${data}`);
  LogUtil.debug(`AI output: ${content}`);

  // 2.4 Remove the wrapper of the content in markdown format
  content = content.trim();
  // 2.4.1 If the content start with '```', remove the wrapper
  if (content.startsWith("```")) {
    content = content.substring(3);
  }

  // 2.4.2 If the content end with '```', remove the wrapper
  content = content.endsWith("```")
    ? content.substring(0, content.length - 3)
    : content;

  // 2.5 Remove the invalid characters from the content
  content = content.trim();
  const inputData = requestData.data;
  const result = content.split("\n");
  // 2.5.1 If the count of the lines in the content is not equal to the input, then throw an error
  if (result.length !== inputData.length) {
    LogUtil.error(`
      Input: ${inputData.join("\n")}
      Output: ${result.join("\n")}
    `);
    if (tryCount < maximumRetryCount) {
      return await correctComments(requestData, tryCount + 1);
    } else {
      throw new Error(
        "The count of the lines in the content is not equal to the input"
      );
    }
  }

  // 3. Return the result.
  return result;
};
