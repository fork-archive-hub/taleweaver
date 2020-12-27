import { BlockComponent } from '../component';

export interface IParagraphAttributes {}

export class ParagraphComponent extends BlockComponent<IParagraphAttributes> {
    render(attributes: Partial<IParagraphAttributes>) {
        return {
            style: {
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                lineHeight: 2,
            },
        };
    }
}
