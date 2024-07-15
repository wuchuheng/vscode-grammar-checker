import * as vscode from "vscode";
import ts from "typescript";
import { Comment } from "../../utils/diagnosticUtil";

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

/**
 *  Extract comments from the source code of a TypeScript file.
 * @param sourceCode
 * @param document
 * @returns
 */
export function extractComments(
  sourceCode: string,
  document: vscode.TextDocument
): Comment[] {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const comments: Comment[] = [];
  const addedCommentPositions = new Set<number>();

  function visit(node: ts.Node) {
    const commentRanges = [
      ...(ts.getLeadingCommentRanges(
        sourceFile.getFullText(),
        node.getFullStart()
      ) || []),
      ...(ts.getTrailingCommentRanges(
        sourceFile.getFullText(),
        node.getEnd()
      ) || []),
    ];

    commentRanges.forEach((commentRange) => {
      // Check if the comment's start position has already been added
      if (!addedCommentPositions.has(commentRange.pos)) {
        addedCommentPositions.add(commentRange.pos); // Mark this start position as added
        const commentText = sourceFile
          .getFullText()
          .slice(commentRange.pos, commentRange.end);
        comments.push({
          text: commentText,
          start: document.positionAt(commentRange.pos),
          end: document.positionAt(commentRange.end),
        });
      }
    });

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return comments;
}

/**
 * Get the comments that will be affected by the insert change.
 * @param change
 */
export function getAffectedCommentsByInsertChange(
  change: vscode.TextDocumentContentChangeEvent,
  commentsInDocument: Comment[]
): Comment[] {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];
  for (const comment of commentsInDocument) {
    // 2.1 If the change is in the comment, return the comment.
    if (
      change.range.start.line >= comment.start.line &&
      change.range.end.line <= comment.end.line
    ) {
      result.push(comment);
      break;
    }
  }

  // 3. Return the result.
  return result;
}

export function getAffectedCommentsByReplaceChange(
  change: vscode.TextDocumentContentChangeEvent,
  commentsInDocument: Comment[]
): Comment[] {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];
  for (const comment of commentsInDocument) {
    // 2.1 If the change is in the comment, return the comment.
    if (
      change.range.start.line >= comment.start.line &&
      change.range.end.line <= comment.end.line
    ) {
      result.push(comment);
      break;
    }
  }

  // 3. Return the result.
  return result;
}

export function getAffectedCommentsByDeleteChange(
  change: vscode.TextDocumentContentChangeEvent,
  commentsInDocument: Comment[]
): Comment[] {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];
  for (const comment of commentsInDocument) {
    // 2.1 If the change is in the comment.
    if (
      change.range.start.line >= comment.start.line &&
      change.range.end.line <= comment.end.line
    ) {
      // 2.2 If the deleted content is not the whole comment, return the comment.
      if (comment.text.length > change.text.length) {
        result.push(comment);
        break;
      }
    }
  }

  // 3. Return the result.
  return result;
}
