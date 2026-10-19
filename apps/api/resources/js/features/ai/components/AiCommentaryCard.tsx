import { useTranslation } from 'react-i18next';
import { Sparkles, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { type AiCommentaryItem } from '../types';

type AiCommentaryCardProps = {
    readonly item: AiCommentaryItem | undefined;
    readonly isLoading: boolean;
    readonly isError: boolean;
    readonly onRetry: () => void;
};

export function AiCommentaryCard({
    item,
    isLoading,
    isError,
    onRetry,
}: AiCommentaryCardProps): React.JSX.Element | null {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 animate-pulse w-full min-w-0">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-100" />
                    <div className="h-4 w-32 rounded-md bg-slate-200" />
                </div>
                <div className="space-y-2">
                    <div className="h-5 w-4/5 rounded-md bg-slate-200" />
                    <div className="h-3.5 w-full rounded-md bg-slate-100" />
                    <div className="h-3.5 w-2/3 rounded-md bg-slate-100" />
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-emerald-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-[24px] border border-amber-200/80 bg-amber-50/40 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 text-xs w-full min-w-0">
                <span className="text-slate-600 font-medium">
                    {t('ai:commentaryFailed')}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-7 px-2.5 text-xs rounded-xl gap-1 shrink-0 bg-white shadow-2xs hover:bg-slate-50"
                >
                    <RefreshCw
                        className="h-3 w-3 text-slate-600"
                        aria-hidden="true"
                    />
                    <span>{t('ai:retry')}</span>
                </Button>
            </div>
        );
    }

    if (!item) {
        return null;
    }

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 w-full min-w-0">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {t('ai:commentaryTitle')}
                </h3>
            </div>

            <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {item.headline}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.body}
                </p>
            </div>

            {item.pros.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-emerald-700">
                        {t('ai:prosTitle')}
                    </span>
                    <ul className="space-y-1">
                        {item.pros.map((pro) => (
                            <li
                                key={pro}
                                className="flex items-start gap-1.5 text-xs text-slate-700"
                            >
                                <Check
                                    className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5"
                                    aria-hidden="true"
                                />
                                <span>{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {item.cautions.length > 0 ? (
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-amber-700">
                        {t('ai:cautionsTitle')}
                    </span>
                    <ul className="space-y-1">
                        {item.cautions.map((cau) => (
                            <li
                                key={cau}
                                className="flex items-start gap-1.5 text-xs text-slate-600"
                            >
                                <AlertTriangle
                                    className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5"
                                    aria-hidden="true"
                                />
                                <span>{cau}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
