import { useTranslation } from 'react-i18next';
import { cn } from '../lib/cn';
import {
    SUPPORTED_LANGUAGES,
    isSupportedLanguage,
    type SupportedLanguage,
} from '../i18n/init';

function Flag({
    lang,
}: {
    readonly lang: SupportedLanguage;
}): React.JSX.Element {
    const common = {
        viewBox: '0 0 30 20',
        className: 'h-[14px] w-[21px] rounded-[2px]',
        'aria-hidden': true,
    } as const;
    if (lang === 'ja') {
        return (
            <svg {...common}>
                <rect width="30" height="20" fill="#fff" />
                <circle cx="15" cy="10" r="5.5" fill="#bc002d" />
            </svg>
        );
    }
    if (lang === 'vi') {
        return (
            <svg {...common}>
                <rect width="30" height="20" fill="#da251d" />
                <path
                    fill="#ffcd00"
                    d="m15 4 1.8 5.5h5.8l-4.7 3.4 1.8 5.5L15 15l-4.7 3.4 1.8-5.5-4.7-3.4h5.8z"
                />
            </svg>
        );
    }
    return (
        <svg {...common}>
            <rect width="30" height="20" fill="#fff" />
            <path
                stroke="#b22234"
                strokeWidth="2"
                d="M0 1h30M0 5h30M0 9h30M0 13h30M0 17h30"
            />
            <rect width="13" height="11" fill="#3c3b6e" />
        </svg>
    );
}

export function LanguageSwitcher(): React.JSX.Element {
    const { t, i18n } = useTranslation();

    const currentLanguage: SupportedLanguage = isSupportedLanguage(
        i18n.resolvedLanguage,
    )
        ? i18n.resolvedLanguage
        : isSupportedLanguage(i18n.language)
          ? i18n.language
          : 'ja';

    return (
        <div
            role="group"
            aria-label={t('common:language')}
            className="flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm"
        >
            {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                    key={lang}
                    type="button"
                    title={t(`common:languages.${lang}`)}
                    aria-label={t(`common:languages.${lang}`)}
                    aria-pressed={lang === currentLanguage}
                    onClick={() => {
                        void i18n.changeLanguage(lang);
                    }}
                    className={cn(
                        'flex h-8 w-8 sm:h-6 sm:w-7 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        lang === currentLanguage
                            ? 'ring-2 ring-[#0b6bdc]'
                            : 'opacity-60 hover:opacity-100',
                    )}
                >
                    <Flag lang={lang} />
                </button>
            ))}
        </div>
    );
}
