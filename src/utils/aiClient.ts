import { API_URL, getSecretKey, MODEL_ID } from "../config/config";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import axios from "axios";

const AiRequest = async (
  messages: Array<ChatCompletionMessageParam>
): Promise<string> => {
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

  return content;
};

export default AiRequest;
