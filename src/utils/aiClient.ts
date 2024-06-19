import "dotenv/config";
import axios from "axios";

/**
 * Represents the response type returned by the AI client.
 * @typedef {object} ResponseType
 * @property {number} id - The ID from the id within the input data, like: `input.items.id`.
 * @property {Array<{ title: string, describe: (string | { text: string; isBold: true })[], range: { star: number, end: number } }>} items - The array of response items.
 * @example
 * // Example response
 * {
 *   id: 1,
 *   items: [
 *     {
 *       title: "Item 1",
 *       describe: ["Description 1", { text: "Bold Description", isBold: true }],
 *       range: { star: 0, end: 10 }
 *     },
 *     {
 *       title: "Item 2",
 *       describe: ["Description 2"],
 *       range: { star: 11, end: 20 }
 *     }
 *   ]
 * }
 */
/**
 * Represents the response type returned by the AI client.
 */
type ResponseType = {
  id: number;
  items: {
    title: string;
    describe: (string | { text: string; isBold: true })[];
    range: {
      star: number;
      end: number;
    };
    replacement: string;
  }[];
};
export default ResponseType;

/**
 * Defines the structure for input data to be processed by an AI system. This type is particularly used for representing
 * a collection of text items contained within a single file, where each item is identified and processed individually.
 *
 * @typedef {Object} InputType - Represents the input data structure for AI processing.
 * @property {string} fileName - The name of the file, including its extension. This is used to identify the file and can provide context about the format or content type expected by the AI.
 * @property {Object[]} items - An array of objects, each representing a distinct piece of text content to be analyzed or processed.
 * @property {number} items.id - A unique identifier for each text item. This ID facilitates tracking and referencing the items during the processing.
 * @property {string} items.content - The actual text content of the item. This is the data that will be analyzed or processed by the AI system.
 *
 * Example Usage:
 *
 * An application that performs sentiment analysis on various text items within a file might use `InputType` to structure its input as follows:
 *
 * {
 *   fileName: "userFeedback.txt",
 *   items: [
 *     {
 *       id: 1,
 *       content: "There are a mitsake"
 *     },
 *     {
 *       id: 2,
 *       content: "a dog"
 *     }
 *   ]
 * }
 *
 * In this example, each item within the `items` array represents a piece of feedback from a user. The `fileName` provides context that this is user feedback, and each `id` and `content` pair specifies individual feedback entries for analysis.
 */
export type InputType = {
  fileName: string;
  items: {
    id: number;
    content: string;
  }[];
};

/**
 * Calls the OpenAI API to generate completions based on user and assistant prompts.
 * @param input The input to be sent to the OpenAI API.
 * @returns A promise that resolves to an array of response objects.
 */
export const aiClient = async (input: InputType): Promise<ResponseType[]> => {
  // 1. Get the bot base URL, token, and ID from environment variables
  const { SECRET_KEY, API_URL, MODEL_ID } = process.env;

  // 2. Create a request to the OpenAI API
  const inputJson = JSON.stringify(input);
  const response = await axios.post(
    `${API_URL}`,
    {
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: `
          #你是一名英语语法智能检查助手,你唯一的工作就是帮助我纠正语法上的错误。我是开发者,所以你的数据输入和输出都是JSON格式,这样我才能解析。
          
          ## 你的数据输入要求:
          1. 我给你的数据只能是JSON格式。
          2. 输入的JSON数据是完整且可被解析的。
          3. 我输入的JSON数据结构如下:
          {
            // fileName是一个字符串,代表了这个文本项所在的文件名
            "fileName": "README.md",
            "items": [
              // 这是一个需要被检查的文本项,里面包含了ID和需要被语法纠正的内容共两个字段
              {
                // ID是一个非常重要的字段,后面的纠错结果会包含这个ID,用来告诉开发者这个纠错结果是针对哪个文本项的
                "id":1," 
                // content是需要被检查的文本内容
                content":"There are mitsake."
              }
              // 这里可以有多个文本项...
              ...
            ]
          }
          
          ## 数据输出说明:
          1, 数据输出的结果只能是JSON格式,不能包含其他格式。
          2, 输出的JSON格式必须保证是完整的,可以被解析的。这一点必须保证,不然后面的开发者无法解析你的结果。
          3, 输出的JSON数据结构如下:
          [
            // 这是一个ID为1的文本项的纠错结果
            {
              // ID是一个非常重要的字段,是对应输入数据中的ID,用来告诉开发者这个纠错结果是针对哪个输入文本项的
              "id":1,
              // items是一个数组,里面包含了对这个文本项的纠错结果
              "items":[
                {
                  // title是这个纠错结果的标题,对这个纠错结果的简要描述，这个标题要精简明了
                  "title":"Correct the spelling",
                  // describe是这个纠错结果的详细描述,里面包含了纠错的具体内容的详细描述
                  // 这个字段是一个数组，数组里面的每个元素都是一个字符串或者一个对象
                  "describe":[
                    "Replace ",
                    // 这里是一个对象，里面包含了一个文本和一个是否加粗的标志,当isBold为true时,这个文本需要加粗显示,目地是为了在纠正结果中突出显示这个文本来提醒用户哪里有错误或哪里需要修改,这一功能非常重要，总之是关键的词需要我特别注意的时候，就需要加粗显示
                    {"text":"mitsake", "isBold":true},
                    " with ",
                    {"text":"mistake", "isBold":true},
                    " to correct the spelling error."
                  ],
                  // range是这个纠错结果的范围,里面包含了这个纠错结果的起始位置和结束位置
                  "range":{
                    "star":10,
                    "end":17
                  },
                  "replacement":"mistake"
                }
                // 这里可以有多个纠错结果...
                ...
              ]
            }
            // 这里可以有多个文本项的纠错结果与我输入的文本项一一对应，记住，是要一一对应的，多余的不要，如我给你的文本项只有一个，那么输出的结果也只能有一个文本项的纠错结果，多余的不准生成
            ...
          ]
        4. 输出的纠正结果中不能有冗余无用的数据，用户输入为: '{"fileName": "README.md", "items": [{"id":1,"content":"She  don\'t like apples."}]}',则输出的结果要满足以下条件：
        - 从用户输入的数据来看看,文本项的数量是1,那么输出的结果也只能有一个文本项的纠错结果。输出的结果中不能有多余的文本项。如:
        \`\`\`[
        // 因为用户输入的数据中只有一个文本项，所以输出的结果也只能有一个文本项的纠错结果不能有多余的文本项，这一点必须做到。
          {...}
         ]
        \`\`\`
        - 输出的JSON结果中不要有多余的字段,只需要包含我上面说的字段就可以了，不要有多余的字段，也不要擅自添加其他字段。
      5. 输出的纠正结果中的纠正内容必须是准确的，不能有错误，不能有遗漏，不能有多余的内容。如：
      - 如,在输出的纠正的结果中的项中的ID必须与输入的数据中的ID对应,不能搞错。
      - 尽可能去除在JSON格式中字段与字段之间的空格和换行符,保持JSON格式的整洁性。

      6. 严格执行我上面说的规则，必须做到。
`,
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

  // 3. Parse the response from the OpenAI API
  const contentJson = response.data.choices[0].message.content;
  const message = JSON.parse(contentJson) as ResponseType[];

  return message;
};
