/**
 * Format the comment by using the standard format.
 */
export const formatTrackComment = (content: string): string => {
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

/**
 *  Format the single line comment by using the standard format.
 * @param content
 * @returns
 */
export const formatSingleLineComment = (content: string): string => {
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
