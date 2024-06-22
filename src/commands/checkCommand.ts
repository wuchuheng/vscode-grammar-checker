import * as vscode from "vscode";
import ts from "typescript";
import { step1 } from "../utils/aiClient";
import { getConfig } from "../utils/configUtil";
import { log } from "console";

interface Comment {
  text: string;
  start: vscode.Position;
  end: vscode.Position;
}

function extractComments(
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
 * Registers the "GrammarChecker.check" command.
 */
export const checkCommand = vscode.commands.registerCommand(
  "GrammarChecker.check",
  () => {
    const config = getConfig();
    console.log(config);

    // const editor = vscode.window.activeTextEditor;
    // if (editor === null) {
    //   return;
    // }
    // // 1. If the file is not a TypeScript file, return.
    // if (editor!.document.languageId !== 'typescript') {
    //   return;
    // }

    // // 2. Get all comments from the TypeScript file.
    // const sourceText = editor!.document.getText();
    // const comments = extractComments(sourceText, editor!.document);

    // // 3. Create a map of comments with an ID.
    // let id = 1;
    // const idMapComment: Map<number, Comment> = new Map();
    // comments.forEach((comment) => {
    //   idMapComment.set(id, comment);
    //   id++;
    // });

    // // 4. Get the related file name with extension, like: hello.ts
    // const fileName = editor!.document.fileName.split('/').pop();

    // // 5. Send the comments to AI for checking the grammar and spelling.

    // const items: Array<{ id: number; content: string }> = [];
    // idMapComment.forEach((comment, id) => {
    //   items.push({ id, content: comment.text });
    // });

    // step1({ fileName: fileName!, items })
    //   .then((res) => {
    //     console.log(res);
    //     res.forEach((item) => {
    //       const { id, items } = item;
    //       const text = idMapComment.get(id)?.text;
    //       items.forEach((correctItem) => {
    //         const deletedWord = text?.slice(
    //           correctItem.range.start,
    //           correctItem.range.end
    //         );
    //         console.log(`Full text: ${text}`);
    //         console.log(`Delete world: ${deletedWord}`);
    //         console.log(`Replace world: ${correctItem.replacement}`);
    //       });
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  }
);

// TODO: Implement logic to get all comments from the TypeScript file.

// const range = new vscode.Range(start, end);
// const diagnostic = new vscode.Diagnostic(
//   range,
//   "Correct your spelling",
//   vscode.DiagnosticSeverity.Warning
// );
// diagnostic.source = "GrammarChecker";
// diagnostics.push(diagnostic);

// diagnosticCollection.set(document.uri, diagnostics);
