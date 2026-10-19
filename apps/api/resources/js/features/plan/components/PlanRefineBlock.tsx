import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { REFINE_CHIP_LIST, applyRefineChip } from '../lib/plan-refine-chips';

type PlanRefineBlockProps = {
    readonly answers: Record<string, unknown>;
    readonly isRegenerating: boolean;
    readonly onRefine: (
        updatedAnswers: Record<string, unknown>,
        freeText?: string,
    ) => Promise<void> | void;
};

export function PlanRefineBlock({
    answers,
    isRegenerating,
    onRefine,
}: PlanRefineBlockProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const [freeText, setFreeText] = useState('');
    const [lastApplied, setLastApplied] = useState<string | null>(null);

    const handleChipClick = async (chipId: string): Promise<void> => {
        if (isRegenerating) return;
        const res = applyRefineChip(chipId, answers);
        setLastApplied(res.log);
        await onRefine(res.updatedAnswers);
    };

    const handleSubmitText = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (isRegenerating || !freeText.trim()) return;
        setLastApplied(freeText.trim());
        await onRefine(answers, freeText.trim());
        setFreeText('');
    };

    return (
        <div className="rounded-[24px] border border-blue-200/80 bg-white p-4 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
            {isRegenerating ? (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-2">
                    <Loader2
                        className="h-7 w-7 text-[#0b6bdc] animate-spin"
                        aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-slate-800">
                        {t('plan:refiningInProgress')}
                    </span>
                </div>
            ) : null}

            {lastApplied ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-800 flex items-center gap-2">
                    <Check
                        className="h-4 w-4 text-emerald-600 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        <span className="font-bold">
                            {t('plan:refineAppliedPrefix')}:{' '}
                        </span>
                        {lastApplied}
                    </span>
                </div>
            ) : null}

            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {t('plan:refineBlockTitle')}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t('plan:refineBlockSubtitle')}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {REFINE_CHIP_LIST.map((chip) => (
                    <button
                        key={chip.id}
                        type="button"
                        disabled={isRegenerating}
                        onClick={() => void handleChipClick(chip.id)}
                        className="rounded-full border border-slate-200 bg-slate-50/80 hover:bg-blue-50 hover:border-blue-300 hover:text-[#0b6bdc] px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer min-h-[36px] sm:min-h-0 flex items-center"
                    >
                        {t(chip.labelKey)}
                    </button>
                ))}
            </div>

            <form
                onSubmit={(e) => void handleSubmitText(e)}
                className="space-y-3 pt-2"
            >
                <textarea
                    rows={2}
                    value={freeText}
                    onChange={(e) => {
                        setFreeText(e.target.value);
                    }}
                    placeholder={t('plan:refinePlaceholder')}
                    disabled={isRegenerating}
                    className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0b6bdc] focus:outline-none transition-all"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400">
                        {t('plan:refineNote')}
                    </p>
                    <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        disabled={isRegenerating || !freeText.trim()}
                        className="rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs h-10 px-4 shrink-0 shadow-xs"
                    >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('plan:refineSubmitButton')}</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
