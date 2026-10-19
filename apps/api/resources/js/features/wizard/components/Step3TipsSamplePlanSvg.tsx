import { useTranslation } from 'react-i18next';

export function Plan3LdkSvg(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <svg
            viewBox="0 0 76 80"
            className="w-full h-full p-1 text-slate-500 bg-white"
            fill="none"
        >
            {/* 1F Plan (Left) */}
            <rect
                x="3"
                y="6"
                width="32"
                height="68"
                stroke="#64748b"
                strokeWidth="1.2"
                fill="#f8fafc"
            />
            <line
                x1="3"
                y1="36"
                x2="35"
                y2="36"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="20"
                y1="6"
                x2="20"
                y2="36"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="3"
                y1="52"
                x2="24"
                y2="52"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="24"
                y1="36"
                x2="24"
                y2="60"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <text
                x="19"
                y="46"
                fontSize="4.5"
                fill="#475569"
                fontWeight="bold"
                textAnchor="middle"
            >
                {t('wizard:roomLdkShort')}
            </text>
            <text x="11" y="22" fontSize="4" fill="#64748b" textAnchor="middle">
                {t('wizard:roomTatamiShort')}
            </text>
            <text
                x="19"
                y="71"
                fontSize="4.5"
                fill="#334155"
                fontWeight="bold"
                textAnchor="middle"
            >
                {t('wizard:planF1')}
            </text>

            {/* 2F Plan (Right) */}
            <rect
                x="41"
                y="6"
                width="32"
                height="68"
                stroke="#64748b"
                strokeWidth="1.2"
                fill="#f8fafc"
            />
            <line
                x1="41"
                y1="38"
                x2="73"
                y2="38"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="57"
                y1="38"
                x2="57"
                y2="74"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <line
                x1="41"
                y1="20"
                x2="59"
                y2="20"
                stroke="#94a3b8"
                strokeWidth="0.9"
            />
            <text
                x="57"
                y="29"
                fontSize="4.5"
                fill="#475569"
                fontWeight="bold"
                textAnchor="middle"
            >
                {t('wizard:roomMasterShort')}
            </text>
            <text x="49" y="56" fontSize="4" fill="#64748b" textAnchor="middle">
                {t('wizard:roomWesternShort')}
            </text>
            <text
                x="57"
                y="71"
                fontSize="4.5"
                fill="#334155"
                fontWeight="bold"
                textAnchor="middle"
            >
                {t('wizard:planF2')}
            </text>
        </svg>
    );
}
