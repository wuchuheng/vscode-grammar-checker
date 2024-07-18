import { API_URL, getSecretKey, MODEL_ID } from "../config/config";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import axios from "axios";
import LogUtil from "./logUtil";

const AiRequest = async (
  messages: Array<ChatCompletionMessageParam>
): Promise<string> => {
  // 2. Processing logic.
  // 2.1 Send the request to the OpenAI API, and get the response from the API.
  const secretKey = await getSecretKey();
  const response = await axios.post(
    `${API_URL}`,
    { model: MODEL_ID, messages },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
    }
  );
  const content = response.data.choices[0].message.content;

  // 2.2 Cost used under statistics
  const { completion_tokens, prompt_tokens, total_tokens } =
    response.data.usage;
  const totalCost = ((total_tokens / 1000) * 0.0001)
    .toString()
    .padStart(6, "0");
  LogUtil.debug(
    `Token usage: completion_tokens: ${completion_tokens} prompt_tokens: ${prompt_tokens} total_tokens: ${total_tokens} Cost: ${totalCost} RMB `
  );

  // 3. Return the result.

  return content;
};

export default AiRequest;
