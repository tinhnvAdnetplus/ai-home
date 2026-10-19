import { useTranslation } from 'react-i18next';
import { Check, Lightbulb } from 'lucide-react';
import { Step3TipsExamples } from './Step3TipsExamples';

export function Step3TipsPanel(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <aside
            aria-label={t('wizard:step3TipsTitle')}
            className="w-full lg:w-[230px] xl:w-[250px] shrink-0 flex flex-col gap-2 xl:gap-2.5 text-foreground h-full justify-between"
        >
            {/* Card 1: 入力のポイント */}
            <div className="rounded-2xl border border-[#fef08a] bg-[#fffdf2] p-3.5 xl:p-4 shadow-xs shrink-0">
                <header className="flex items-center gap-1.5 mb-2.5 text-slate-900 font-bold text-xs xl:text-[13.5px]">
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{t('wizard:step3TipsTitle')}</span>
                </header>
                <ul className="flex flex-col gap-2 text-xs xl:text-[11.5px] text-slate-700 leading-snug">
                    <li className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{t('wizard:step3Tip1')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{t('wizard:step3Tip2')}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{t('wizard:step3Tip3')}</span>
                    </li>
                </ul>
            </div>

            {/* Card 2: 間取りの参考例 */}
            <Step3TipsExamples />
        </aside>
    );
}
