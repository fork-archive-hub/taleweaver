
import Node from './Node';
import BranchNode from './BranchNode';
import LeafNode from './LeafNode';

export type Child = BranchNode | LeafNode;

export default class Doc extends Node {
  protected children: Child[];

  constructor() {
    super();
    this.children = [];
  }

  getType(): string {
    return 'Doc';
  }

  getChildren(): Child[] {
    return this.children;
  }

  insertChild(child: Child, offset: number) {
    this.children.splice(offset, 0, child);
  }

  deleteChild(child: Child) {
    const childOffset = this.children.indexOf(child);
    if (childOffset < 0) {
      throw new Error('Cannot delete child, child not found.');
    }
    this.children.splice(childOffset, 1);
  }
}
