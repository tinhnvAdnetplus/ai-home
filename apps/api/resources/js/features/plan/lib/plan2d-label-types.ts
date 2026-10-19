export type LabelBox = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};

export type LabelLayout = {
    readonly id: string;
    readonly name: string;
    readonly joStr: string;
    readonly textColor: string;
    hasJo: boolean;
    x: number;
    y: number;
    fontSize: number;
    box: LabelBox;
};

export function measureTextUnits(text: string): number {
    let units = 0;
    for (const ch of text) {
        units += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 1.05 : 0.62;
    }
    return Math.max(1, units);
}

export function computeLabelBox(
    x: number,
    y: number,
    name: string,
    fontSize: number,
    hasJo: boolean,
): LabelBox {
    const nameWidth = measureTextUnits(name) * fontSize;
    const joWidth = hasJo ? 3.2 * fontSize : 0;
    const width = Math.max(nameWidth, joWidth) + fontSize * 0.35;
    const height = hasJo ? fontSize * 2.15 : fontSize * 1.25;
    return {
        minX: x - width / 2,
        maxX: x + width / 2,
        minY: y - height / 2,
        maxY: y + height / 2,
    };
}

