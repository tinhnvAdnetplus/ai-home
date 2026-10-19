import { useTranslation } from 'react-i18next';

export function PlanFlatSvg(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <svg
            viewBox="0 0 76 80"
            className="w-full h-full p-1 text-slate-500 bg-white"
            fill="none"
        >
            <polygon
                points="4,8 72,8 72,72 26,72 26,56 4,56"
                stroke="#64748b"
                strokeWidth="1.2"
                fill="#f8fafc"
            />
            <line
                x1="4"
                y1="32"
                x2="48"
                y2="32"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="48"
                y1="8"
                x2="48"
                y2="72"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="4"
                y1="44"
                x2="26"
                y2="44"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="26"
                y1="32"
                x2="26"
                y2="56"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="48"
                y1="40"
                x2="72"
                y2="40"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <text
                x="26"
                y="22"
                fontSize="5"
                fill="#475569"
                fontWeight="bold"
                textAnchor="middle"
            >
                {t('wizard:roomLdkShort')}
            </text>
            <text
                x="60"
                y="26"
                fontSize="4.5"
                fill="#64748b"
                textAnchor="middle"
            >
                {t('wizard:roomMasterShort')}
            </text>
            <text
                x="60"
                y="58"
                fontSize="4.5"
                fill="#64748b"
                textAnchor="middle"
            >
                {t('wizard:roomWesternShort')}
            </text>
        </svg>
    );
}
