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

    // 3. Assert the response from the AI system
    // 3.1 Assert the count of the response items is 2;
    expect(response.length).toBe(2);

    //3.2 Assert the first response item
    const firstItem = response[0];
    expect(firstItem.id).toBe(1);
    // 3.2.1 Assert the length of items is greater than 0.
    expect(firstItem.items.length).toBeGreaterThan(0);

    // 3.3 Assert the second response item
    const secondItem = response[1];
    expect(secondItem.id).toBe(2);
    // 3.3.1 Assert the length of items is greater than 0.
    expect(secondItem.items.length).toBeGreaterThan(0);
  }, 600000);
});
