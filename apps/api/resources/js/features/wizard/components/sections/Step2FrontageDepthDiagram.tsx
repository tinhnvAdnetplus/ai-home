import { useTranslation } from 'react-i18next';

export function Step2FrontageDepthDiagram(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div
            className="relative flex items-center justify-center w-full sm:w-[145px] shrink-0"
            aria-hidden="true"
        >
            <svg
                viewBox="0 0 140 120"
                className="w-full h-auto max-h-[110px]"
                fill="none"
            >
                {/* Top horizontal arrow + label (間口) */}
                <text
                    x="50"
                    y="11"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#334155"
                >
                    {t('wizard:plotFrontage')}
                </text>
                <line
                    x1="18"
                    y1="17"
                    x2="82"
                    y2="17"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                />
                <polygon points="18,17 23,14 23,20" fill="#0f172a" />
                <polygon points="82,17 77,14 77,20" fill="#0f172a" />

                {/* Green plot rectangle */}
                <rect
                    x="18"
                    y="23"
                    width="64"
                    height="85"
                    rx="2"
                    fill="#a7d397"
                    stroke="#7eb86b"
                    strokeWidth="1.2"
                />

                {/* Right vertical arrow + label (奥行き) */}
                <line
                    x1="90"
                    y1="23"
                    x2="90"
                    y2="108"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                />
                <polygon points="90,23 87,28 93,28" fill="#0f172a" />
                <polygon points="90,108 87,103 93,103" fill="#0f172a" />
                <text
                    x="98"
                    y="70"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#334155"
                >
                    {t('wizard:plotDepth')}
                </text>
            </svg>
        </div>
    );
}
