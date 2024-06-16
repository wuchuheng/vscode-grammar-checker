import * as assert from "assert";
import "dotenv/config";

import OpenAI from "openai";

suite("Test the AI cleint", () => {
  test("Test AI from volcengine", async () => {
    const { env } = process;
    console.log(env);
    // // const openai = new OpenAI({
    // //   apiKey: process.env["SECRET_KEY"],
    // //   baseURL: process.env["BASE_URL"],
    // // });
    // // assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     {
    //       role: "system",
    //       content: "你是豆包，是由字节跳动开发的 AI 人工智能助手",
    //     },
    //     { role: "user", content: "常见的十字花科植物有哪些？" },
    //   ],
    //   model: "ep-20240616125028-dw68q",
    // });
    // console.log(completion.choices[0]?.message?.content);
  });
});
