export type LandShape = 'rectangle' | 'square' | 'irregular' | 'unknown';

export function isLandShape(key: string | undefined): key is LandShape {
    if (!key) return false;
    return (
        key === 'rectangle' ||
        key === 'square' ||
        key === 'irregular' ||
        key === 'unknown' ||
        key === 'tile-shape-rectangle' ||
        key === 'tile-shape-square' ||
        key === 'tile-shape-irregular' ||
        key === 'tile-shape-unknown' ||
        key.startsWith('tile-shape-')
    );
}

export function normalizeLandShape(key: string): LandShape {
    if (key.includes('rectangle')) return 'rectangle';
    if (key.includes('square')) return 'square';
    if (key.includes('irregular')) return 'irregular';
    return 'unknown';
}

type LandShapeSvgProps = {
    readonly shape: LandShape;
    readonly className?: string | undefined;
};

export function LandShapeSvg({
    shape,
    className = 'w-full h-full max-h-[50px]',
}: LandShapeSvgProps): React.JSX.Element {
    const stroke = '#7eb86b';
    const fill = '#b8dc9a';

    if (shape === 'rectangle') {
        return (
            <svg
                viewBox="0 0 70 70"
                className={className}
                fill="none"
                aria-hidden="true"
            >
                <rect
                    x="22"
                    y="8"
                    width="26"
                    height="54"
                    rx="2"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                />
            </svg>
        );
    }

    if (shape === 'square') {
        return (
            <svg
                viewBox="0 0 70 70"
                className={className}
                fill="none"
                aria-hidden="true"
            >
                <rect
                    x="15"
                    y="15"
                    width="40"
                    height="40"
                    rx="2"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                />
            </svg>
        );
    }

    if (shape === 'irregular') {
        return (
            <svg
                viewBox="0 0 70 70"
                className={className}
                fill="none"
                aria-hidden="true"
            >
                <polygon
                    points="18,56 56,56 46,20 28,16"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    // unknown: irregular multi-corner polygon
    return (
        <svg
            viewBox="0 0 70 70"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            <polygon
                points="16,56 54,56 54,32 35,16 16,32"
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}
