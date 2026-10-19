export function PlanTypeOtherSvg(): React.JSX.Element {
    return (
        <svg
            viewBox="0 0 72 54"
            className="w-full h-full p-1"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Tree on the left */}
            <path
                d="M18 44V34M18 34C15 34 13 32 13 29C13 26.5 15 25 17 25C17 22.5 19 20 22 20C25 20 27 22 27 24C29 24 31 26 31 28.5C31 31.5 29 34 26 34C24 34 20 34 18 34Z"
                stroke="#94a3b8"
                strokeWidth="1.3"
                fill="#f8fafc"
            />
            {/* Chimney */}
            <path d="M50 20V15H54V24" stroke="#94a3b8" strokeWidth="1.3" />
            {/* Roof */}
            <path d="M26 26L43 12L60 26" stroke="#64748b" strokeWidth="1.5" />
            {/* Walls */}
            <path
                d="M30 26V44H56V26"
                stroke="#64748b"
                strokeWidth="1.3"
                fill="#f8fafc"
            />
            {/* Windows on left side of house */}
            <rect
                x="34"
                y="29"
                width="6"
                height="6"
                stroke="#94a3b8"
                strokeWidth="1.1"
            />
            <rect
                x="41"
                y="29"
                width="6"
                height="6"
                stroke="#94a3b8"
                strokeWidth="1.1"
            />
            {/* Door on right side of house */}
            <rect
                x="48"
                y="33"
                width="6"
                height="11"
                stroke="#94a3b8"
                strokeWidth="1.1"
            />
            {/* Ground line */}
            <path d="M10 44H64" stroke="#cbd5e1" strokeWidth="1.2" />
        </svg>
    );
}
