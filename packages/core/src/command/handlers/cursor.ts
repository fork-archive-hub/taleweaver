import { ICursorService } from '../../cursor/service';
import { ILayoutService } from '../../layout/service';
import { IModelService } from '../../model/service';
import { ITransformService } from '../../transform/service';
import { Transformation } from '../../transform/transformation';
import { ICommandHandler } from '../command';

function atPreviousLine(position: number, leftLock: number, layoutService: ILayoutService) {
    const { node: lineLayoutNode, position: linePosition } = layoutService.describePosition(position).atLine();
    const previousLine = lineLayoutNode.previousCrossParentSibling;
    if (!previousLine) {
        return position - linePosition;
    }
    return position - linePosition - previousLine.size + previousLine.convertCoordinatesToPosition(leftLock, 0);
}

function atNextLine(position: number, leftLock: number, layoutService: ILayoutService) {
    const { node: lineLayoutNode, position: linePosition } = layoutService.describePosition(position).atLine();
    const nextLine = lineLayoutNode.nextCrossParentSibling;
    if (!nextLine) {
        return position - linePosition + lineLayoutNode.size - 1;
    }
    return position - linePosition + lineLayoutNode.size + nextLine.convertCoordinatesToPosition(leftLock, 0);
}

function atPreviousWord(position: number, layoutService: ILayoutService) {
    const { node: wordLayoutNode, position: wordPosition } = layoutService.describePosition(position).atWord();
    if (wordPosition > 0) {
        return position - wordPosition;
    }
    const previousWord = wordLayoutNode.previousCrossParentSibling;
    if (!previousWord) {
        return position;
    }
    return position - previousWord.size;
}

function atNextWord(position: number, layoutService: ILayoutService) {
    const { node: wordLayoutNode, position: wordPosition } = layoutService.describePosition(position).atWord();
    if (wordPosition < wordLayoutNode.size - 1) {
        return position - wordPosition + wordLayoutNode.trimmedSize;
    }
    const nextWord = wordLayoutNode.nextCrossParentSibling;
    if (!nextWord) {
        return position;
    }
    return position - wordPosition + wordLayoutNode.size + wordLayoutNode.trimmedSize;
}

function atLineStart(position: number, layoutService: ILayoutService) {
    const { position: linePosition } = layoutService.describePosition(position).atLine();
    if (linePosition === 0) {
        return position;
    }
    return position - linePosition;
}

function atLineEnd(position: number, layoutService: ILayoutService) {
    const { node: lineLayoutNode, position: linePosition } = layoutService.describePosition(position).atLine();
    if (linePosition >= lineLayoutNode.size - 1) {
        return position;
    }
    return position - linePosition + lineLayoutNode.size - 1;
}

export class MoveCommandHandler implements ICommandHandler {
    static dependencies = ['transform'] as const;

    constructor(protected transformService: ITransformService) {}

    async handle(position: number) {
        this.transformService.applyTransformation(new Transformation([], position));
    }
}

export class MoveBackwardCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor'] as const;

    constructor(protected transformService: ITransformService, protected cursorService: ICursorService) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        let newPosition: number;
        if (cursor.anchor === cursor.head) {
            newPosition = cursor.anchor - 1;
        } else {
            newPosition = Math.min(cursor.anchor, cursor.head);
        }
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveForwardCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor'] as const;

    constructor(protected transformService: ITransformService, protected cursorService: ICursorService) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        let newPosition: number;
        if (cursor.anchor === cursor.head) {
            newPosition = cursor.anchor + 1;
        } else {
            newPosition = Math.max(cursor.anchor, cursor.head);
        }
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveBackwardByLineCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const position = Math.min(cursor.anchor, cursor.head);
        const newPosition = atPreviousLine(position, cursor.leftLock, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newPosition, newPosition, true));
    }
}

export class MoveForwardByLineCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const position = Math.max(cursor.anchor, cursor.head);
        const newPosition = atNextLine(position, cursor.leftLock, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newPosition, newPosition, true));
    }
}

export class MoveBackwardByWordCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const position = Math.min(cursor.anchor, cursor.head);
        const newPosition = atPreviousWord(position, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveForwardByWordCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const position = Math.max(cursor.anchor, cursor.head);
        const newPosition = atNextWord(position, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveToLineStartCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const position = Math.min(cursor.anchor, cursor.head);
        const newPosition = atLineStart(position, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveToLineEndCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const position = Math.min(cursor.anchor, cursor.head);
        const newPosition = atLineEnd(position, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveToDocStartCommandHandler implements ICommandHandler {
    static dependencies = ['transform'] as const;

    constructor(protected transformService: ITransformService) {}

    async handle() {
        const newPosition = 0;
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveToDocEndCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'model'] as const;

    constructor(protected transformService: ITransformService, protected modelService: IModelService) {}

    async handle() {
        const newPosition = this.modelService.getDocContentSize() - 1;
        this.transformService.applyTransformation(new Transformation([], newPosition));
    }
}

export class MoveHeadCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor'] as const;

    constructor(protected transformService: ITransformService, protected cursorService: ICursorService) {}

    async handle(position: number) {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        this.transformService.applyTransformation(new Transformation([], position, cursor.anchor));
    }
}

export class MoveHeadBackwardCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor'] as const;

    constructor(protected transformService: ITransformService, protected cursorService: ICursorService) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = Math.max(0, cursor.head - 1);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadForward implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'model'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected modelService: IModelService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const contentSize = this.modelService.getDocContentSize();
        const newHead = Math.min(contentSize - 1, cursor.head + 1);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadBackwardByLineCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = atPreviousLine(cursor.head, cursor.leftLock, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadForwardByLineCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = atNextLine(cursor.head, cursor.leftLock, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadBackwardByWordCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = atPreviousWord(cursor.head, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadForwardByWordCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = atNextWord(cursor.head, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadToLineStartCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = atLineStart(cursor.head, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadToLineEndCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newHead = atLineEnd(cursor.head, this.layoutService);
        this.transformService.applyTransformation(new Transformation([], newHead, cursor.anchor));
    }
}

export class MoveHeadToDocStartCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor'] as const;

    constructor(protected transformService: ITransformService, protected cursorService: ICursorService) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        const newHead = 0;
        this.transformService.applyTransformation(new Transformation([], newHead, cursor?.anchor));
    }
}

export class MoveHeadToDocEndCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'model'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected modelService: IModelService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        const newHead = this.modelService.getDocContentSize() - 1;
        this.transformService.applyTransformation(new Transformation([], newHead, cursor?.anchor));
    }
}

export class SelectAllCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'model'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected modelService: IModelService,
    ) {}

    async handle() {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const newAnchor = 0;
        const newHead = this.modelService.getDocContentSize() - 1;
        this.transformService.applyTransformation(new Transformation([], newHead, newAnchor));
    }
}

export class SelectWordCommandHandle implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle(position: number) {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        let { node: wordLayoutNode, position: wordPosition } = this.layoutService.describePosition(position).atWord();
        if (wordLayoutNode.trimmedSize === 0) {
            const previousWord = wordLayoutNode.previousCrossParentSibling;
            if (!previousWord) {
                return;
            }
            wordLayoutNode = previousWord;
            wordPosition += wordLayoutNode.size;
        }
        const newHead = position - wordPosition + wordLayoutNode.trimmedSize;
        const newAnchor = position - wordPosition;
        this.transformService.applyTransformation(new Transformation([], newHead, newAnchor));
    }
}

export class SelectBlockCommandHandler implements ICommandHandler {
    static dependencies = ['transform', 'cursor', 'layout'] as const;

    constructor(
        protected transformService: ITransformService,
        protected cursorService: ICursorService,
        protected layoutService: ILayoutService,
    ) {}

    async handle(position: number) {
        const cursor = this.cursorService.getCursor();
        if (!cursor) {
            return;
        }
        const { node: blockLayoutNode, position: blockPosition } = this.layoutService
            .describePosition(position)
            .atBlock();
        const newHead = position - blockPosition + blockLayoutNode.size - 1;
        const newAnchor = position - blockPosition;
        this.transformService.applyTransformation(new Transformation([], newHead, newAnchor));
    }
}