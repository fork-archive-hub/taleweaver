import RootNode from '../tree/RootNode';
import Doc from '../model/Doc';
import RenderNode from './RenderNode';
import BlockRenderNode from './BlockRenderNode';

export type Child = BlockRenderNode;

type OnUpdatedSubscriber = () => void;

export default class DocRenderNode extends RenderNode implements RootNode {
  protected width: number;
  protected height: number;
  protected padding: number;
  protected children: Child[];
  protected onUpdatedSubscribers: OnUpdatedSubscriber[];

  constructor(id: string) {
    super(id);
    this.width = 0;
    this.height = 0;
    this.padding = 0;
    this.children = [];
    this.onUpdatedSubscribers = [];
  }

  getType(): string {
    return 'DocRenderNode';
  }

  setVersion(version: number) {
    this.version = version;
  }

  getVersion(): number {
    return this.version;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getPadding(): number {
    return this.padding;
  }

  getInnerWidth(): number {
    return this.width - this.padding - this.padding;
  }

  getInnerHeight(): number {
    return this.height - this.padding - this.padding;
  }

  insertChild(child: Child, offset: number | null = null) {
    child.setParent(this);
    if (offset === null) {
      this.children.push(child);
    } else {
      this.children.splice(offset, 0, child);
    }
    this.clearCache();
  }

  deleteChild(child: Child) {
    const childOffset = this.children.indexOf(child);
    if (childOffset < 0) {
      throw new Error('Cannot delete child, child not found.');
    }
    child.setParent(null);
    this.children.splice(childOffset, 1);
    this.clearCache();
  }

  getChildren(): Child[] {
    return this.children;
  }

  getSelectableSize() {
    if (this.selectableSize === undefined) {
      let selectableSize = 0;
      this.children.forEach(child => {
        selectableSize += child.getSelectableSize();
      });
      this.selectableSize = selectableSize;
    }
    return this.selectableSize;
  }

  getModelSize(): number {
    if (this.modelSize === undefined) {
      let modelSize = 2;
      this.children.forEach(child => {
        modelSize += child.getModelSize();
      });
      this.modelSize = modelSize;
    }
    return this.modelSize;
  }

  convertSelectableOffsetToModelOffset(selectableOffset: number): number {
    let cumulatedSelectableOffset = 0;
    let cumulatedModelOffset = 1;
    for (let n = 0, nn = this.children.length; n < nn; n++) {
      const child = this.children[n];
      const childSelectableOffset = child.getSelectableSize();
      if (cumulatedSelectableOffset + childSelectableOffset > selectableOffset) {
        return cumulatedModelOffset + child.convertSelectableOffsetToModelOffset(selectableOffset - cumulatedSelectableOffset);
      }
      cumulatedSelectableOffset += childSelectableOffset;
      cumulatedModelOffset += child.getModelSize();
    }
    throw new Error(`Selectable offset ${selectableOffset} is out of range.`);
  }

  onModelUpdated(element: Doc) {
    this.id = element.getID();
    this.width = element.getWidth();
    this.height = element.getHeight();
    this.padding = element.getPadding();
    this.clearCache();
  }

  subscribeOnUpdated(onUpdatedSubscriber: OnUpdatedSubscriber) {
    this.onUpdatedSubscribers.push(onUpdatedSubscriber);
  }

  onUpdated() {
    this.onUpdatedSubscribers.forEach(onUpdatedSubscriber => {
      onUpdatedSubscriber();
    });
  }
}