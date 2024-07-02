import * as vscode from "vscode";
import { HoverInformation } from "../store/store";

// Define a new type for intervals
export type QueryResult = HoverInformation | null;

// IntervalNode class: Represents a node in the Interval Tree
export class IntervalNode {
  interval: HoverInformation; // The interval [start, end] using the new Interval type
  max: vscode.Position; // The maximum end value in the subtree rooted at this node
  left: IntervalNode | null = null; // Left child
  right: IntervalNode | null = null; // Right child

  // Constructor: Initializes a new instance of the IntervalNode class
  constructor(hoverInFormation: HoverInformation) {
    this.interval = hoverInFormation; // 1. Handling input: Assign interval to the node
    this.max = hoverInFormation.range.end;
  }
}

// IntervalTree class: Represents an interval tree
export class IntervalTree {
  root: IntervalNode | null = null; // The root node of the interval tree

  // insert method: Inserts a new interval into the interval tree
  insert(hoverInformation: HoverInformation): void {
    // 1. Handling input: Start insertion from the root
    this.root = this._insert(this.root, hoverInformation);
  }

  // _insert method: Recursively inserts a new interval into the tree
  private _insert(
    node: IntervalNode | null,
    inputNode: HoverInformation
  ): IntervalNode {
    if (node === null) {
      // 2.1 Base case: If current node is null, create a new IntervalNode
      return new IntervalNode(inputNode);
    }

    const start = inputNode.range.start; // Start of the interval

    // 2.2 Recursive case: Decide whether to insert into the left or right subtree
    const isLessThan =
      start.line < node.interval.range.start.line &&
      start.character < node.interval.range.start.character;
    if (isLessThan) {
      // 2.2.1 If interval starts before current node's interval, insert into left subtree
      node.left = this._insert(node.left, inputNode);
    } else {
      // 2.2.2 Otherwise, insert into right subtree
      node.right = this._insert(node.right, inputNode);
    }

    // 2.3 Update the max value of the current node
    const isGreaterThanCurrentNodeMax =
      node.max.line < inputNode.range.end.line &&
      node.max.character < inputNode.range.end.character;
    if (isGreaterThanCurrentNodeMax) {
      node.max = inputNode.range.end;
    }

    // 3. Return result: Return the node after insertion
    return node;
  }

  // query method: Queries the tree for any interval that overlaps with the given interval
  query(inputPosition: vscode.Position): QueryResult {
    // 1. Handling input: Start querying from the root
    return this._query(this.root, inputPosition);
  }

  // _query method: Recursively searches for an overlapping interval
  private _query(
    node: IntervalNode | null,
    inputPosition: vscode.Position
  ): QueryResult {
    // 1. Handling input.
    // 2. Process logic.

    // 2.1 Base case: If current node is null, no overlap is found
    if (node === null) {
      // 3. Return result.
      return null;
    }

    // 2.2 Check for overlap with the current node's interval
    if (this._isOverlaps(node.interval.range, inputPosition)) {
      // 3. Return result: Overlap found
      return node.interval;
    }

    // 2.3 Recursive case: Decide whether to search in the left or right subtree
    const isQueryLeft =
      node.left !== null &&
      node.left.max.line >= inputPosition.line &&
      node.left.max.character >= inputPosition.character;
    if (isQueryLeft) {
      // 2.3.1 If there's a potential overlap in the left subtree, search there
      const result = this._query(node.left, inputPosition);
      // 3. Return result: Return the result if overlap is found
      return result;
    }

    // 2.3.2 Otherwise, search in the right subtree
    return this._query(node.right, inputPosition);
  }

  // _overlaps method: Checks if two intervals overla.AccessibilityInformationp
  private _isOverlaps(
    storedNodeRange: vscode.Range,
    inputQueryPosition: vscode.Position
  ): boolean {
    // 1. Handling input: Compare the intervals
    // 2. Process logic: Determine overlap
    const isLineOverLap = storedNodeRange.start.line <= inputQueryPosition.line;
    const isCharacterOverLap =
      storedNodeRange.start.character <= inputQueryPosition.character;

    const result = isLineOverLap && isCharacterOverLap;

    // 3. Return result: True if overlaps, false otherwise
    return result;
  }
}
