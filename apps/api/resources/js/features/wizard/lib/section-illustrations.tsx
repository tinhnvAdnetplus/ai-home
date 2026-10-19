import { useTranslation } from 'react-i18next';
import livingUrl from '../assets/generated/hero-living.jpg';
import { getTilePhoto } from './tile-photos';

export function hasSectionIllustration(sectionKey: string): boolean {
    return (
        sectionKey === 'frontage_depth_section' ||
        sectionKey === 'life_work_section'
    );
}

/**
 * Inline illustration component for sections that display a visual diagram/photo
 * next to their fields (e.g. Step 2 frontage/depth plot diagram, Step 4 remote work image).
 */
export function SectionIllustration({
    sectionKey,
}: {
    readonly sectionKey: string;
}): React.JSX.Element | null {
    const { t } = useTranslation();

    if (sectionKey === 'frontage_depth_section') {
        const frontageLabel = t('wizard:plotFrontage');
        const depthLabel = t('wizard:plotDepth');

        return (
            <div
                className="relative flex items-center justify-center p-1 w-full max-w-[140px] shrink-0"
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
                        {frontageLabel}
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
                        fill="#b8dc9a"
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
                        {depthLabel}
                    </text>
                </svg>
            </div>
        );
    }

    if (sectionKey === 'life_work_section') {
        const deskPhoto = getTilePhoto('life-work-desk');
        return (
            <div
                className="overflow-hidden rounded-lg border border-slate-200 aspect-[4/3] w-full max-w-[125px] shadow-xs shrink-0 hidden sm:block"
                aria-hidden="true"
            >
                <img
                    src={deskPhoto ?? livingUrl}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    return null;
}
