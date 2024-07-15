import { describe, test } from "mocha";
import { isGrammarCorrect } from "./grammar";
import LogUtil from "../../utils/logUtil";
describe("Grammar API tests.", () => {
  test("Test API `isGrammarCorrect`", async () => {
    // 2. Processing Logic.
    // 2.1 Create the test cases.
    const testCases: { text: string; corrected: boolean }[] = [
      { text: "There is a error", corrected: false },
      { text: "There is an error", corrected: true },
      { text: "She don't like apples", corrected: false },
      { text: "She doesn't like apples", corrected: true },
      { text: "I has a cat", corrected: false },
      { text: "I have a cat", corrected: true },
      { text: "He go to school every day", corrected: false },
      { text: "He goes to school every day", corrected: true },
      { text: "They was happy", corrected: false },
      { text: "They were happy", corrected: true },
      { text: "We seen the movie", corrected: false },
      { text: "We saw the movie", corrected: true },
      { text: "Its a beautiful day", corrected: false },
      { text: "It's a beautiful day", corrected: true },
      { text: "Your the best", corrected: false },
      { text: "You're the best", corrected: true },
      { text: "Can I goes with you?", corrected: false },
      { text: "Can I go with you?", corrected: true },
      { text: "She is more taller than him", corrected: false },
      { text: "She is taller than him", corrected: true },
      { text: "Him and I are friends", corrected: false },
      { text: "He and I are friends", corrected: true },
      {
        text: "I am going to the store, do you wants anything?",
        corrected: false,
      },
      {
        text: "I am going to the store, do you want anything?",
        corrected: true,
      },
      { text: "She can sings very well", corrected: false },
      { text: "She can sing very well", corrected: true },
      { text: "He don't know nothing about it", corrected: false },
      { text: "He doesn't know anything about it", corrected: true },
      { text: "We was going to the party", corrected: false },
      { text: "We were going to the party", corrected: true },
      { text: "This is the book what I bought", corrected: false },
      { text: "This is the book that I bought", corrected: true },
      { text: "Where did you went yesterday?", corrected: false },
      { text: "Where did you go yesterday?", corrected: true },
      { text: "I seen her at the mall", corrected: false },
      { text: "I saw her at the mall", corrected: true },
    ];

    // 2.2 Create tasks for each test case.
    const tasks: Promise<boolean>[] = testCases.map(async (testCase) => {
      // 2.3 Call the function to test.
      const result = await isGrammarCorrect(testCase.text);
      // 2.4 Check if the result is correct.
      if (result !== testCase.corrected) {
        LogUtil.error(`The result is incorrect for the text: ${testCase.text}`);
      }
      return result;
    });

    // 2.5 Wait for all the tasks to complete.
    await Promise.all(tasks);
  });
});
