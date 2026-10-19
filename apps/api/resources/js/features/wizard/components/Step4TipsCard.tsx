import { useTranslation } from 'react-i18next';
import { Check, Lightbulb } from 'lucide-react';

export function Step4TipsCard(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <section
            aria-label={t('wizard:step4TipsTitle')}
            className="flex flex-col justify-between rounded-2xl border border-rose-200/80 bg-[#fffbfc] p-3 xl:p-3.5 shadow-xs xl:col-span-4 relative overflow-hidden h-full min-h-[145px] xl:min-h-[155px]"
        >
            <div>
                <header className="flex items-center gap-1.5 mb-2 text-[#ec3064] font-bold text-xs xl:text-[13.5px]">
                    <Lightbulb
                        className="h-4 w-4 text-amber-500 shrink-0"
                        aria-hidden="true"
                    />
                    <span>{t('wizard:step4TipsTitle')}</span>
                </header>
                <ul className="flex flex-col gap-1.5 xl:gap-2 text-xs xl:text-[11.5px] text-slate-600 leading-snug">
                    <li className="flex items-start gap-1.5">
                        <Check
                            className="h-3.5 w-3.5 text-[#ec3064] shrink-0 mt-0.5"
                            aria-hidden="true"
                        />
                        <span>{t('wizard:step4Tip1')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                        <Check
                            className="h-3.5 w-3.5 text-[#ec3064] shrink-0 mt-0.5"
                            aria-hidden="true"
                        />
                        <span>{t('wizard:step4Tip2')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                        <Check
                            className="h-3.5 w-3.5 text-[#ec3064] shrink-0 mt-0.5"
                            aria-hidden="true"
                        />
                        <span>{t('wizard:step4Tip3')}</span>
                    </li>
                </ul>
            </div>
            <div className="mt-1 flex justify-end">
                <svg
                    className="h-11 w-14 shrink-0"
                    viewBox="0 0 52 42"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    {/* Cream walls */}
                    <rect
                        x="12"
                        y="18"
                        width="26"
                        height="18"
                        fill="#fffbeb"
                        stroke="#b45309"
                        strokeWidth="1.2"
                    />
                    {/* Terracotta / Brown roof */}
                    <polygon
                        points="25,4 6,19 44,19"
                        fill="#c2410c"
                        stroke="#9a3412"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                    {/* Windows */}
                    <rect
                        x="15"
                        y="22"
                        width="6"
                        height="6"
                        fill="#ffffff"
                        stroke="#b45309"
                        strokeWidth="0.8"
                    />
                    <line
                        x1="18"
                        y1="22"
                        x2="18"
                        y2="28"
                        stroke="#b45309"
                        strokeWidth="0.6"
                    />
                    <line
                        x1="15"
                        y1="25"
                        x2="21"
                        y2="25"
                        stroke="#b45309"
                        strokeWidth="0.6"
                    />
                    <rect
                        x="29"
                        y="22"
                        width="6"
                        height="6"
                        fill="#ffffff"
                        stroke="#b45309"
                        strokeWidth="0.8"
                    />
                    <line
                        x1="32"
                        y1="22"
                        x2="32"
                        y2="28"
                        stroke="#b45309"
                        strokeWidth="0.6"
                    />
                    <line
                        x1="29"
                        y1="25"
                        x2="35"
                        y2="25"
                        stroke="#b45309"
                        strokeWidth="0.6"
                    />
                    {/* Door */}
                    <rect
                        x="22"
                        y="28"
                        width="6"
                        height="8"
                        rx="0.5"
                        fill="#9a3412"
                    />
                    {/* Tree */}
                    <rect x="44" y="30" width="2" height="6" fill="#78350f" />
                    <circle cx="45" cy="25" r="5.5" fill="#22c55e" />
                </svg>
            </div>
        </section>
    );
}
