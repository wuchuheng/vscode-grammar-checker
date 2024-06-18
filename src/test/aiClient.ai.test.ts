import { describe, expect, test } from "@jest/globals";
import "dotenv/config";
import ResponseType, { aiClient, InputType } from "../utils/aiClient";

// Add the test timeout for 10 minutes
describe("volcengine model", () => {
  test("Test model", async () => {
    // 1. Define the input data for the AI system
    const input: InputType = {
      fileName: "userFeedback.txt",
      items: [
        {
          id: 1,
          content: "I loves the product, it's great!",
        },
        {
          id: 2,
          content: "The product is terrible, I want an refund.",
        },
      ],
    };

    // 2. Call the AI client to process the input data
    const response: ResponseType[] = await aiClient(input);
    console.log(response);
  }, 600000);
});
