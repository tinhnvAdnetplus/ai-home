import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { type BdmIssue } from '@aihome/bdm';
import { Badge } from '@/shared/ui/Badge';

type WarningsListProps = {
    readonly warnings: readonly BdmIssue[];
};

export function WarningsList({
    warnings,
}: WarningsListProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        {t('plan:warningsTitle')}
                    </h2>
                </div>
                {warnings.length > 0 ? (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-2 py-0.5">
                        {t('plan:issuesDetected', { count: warnings.length })}
                    </span>
                ) : null}
            </div>

            {warnings.length === 0 ? (
                <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5">
                    <CheckCircle2
                        className="h-4 w-4 text-emerald-600 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="font-medium">
                        {t('plan:allChecksPassed')}
                    </span>
                </div>
            ) : (
                <ul className="space-y-2.5">
                    {warnings.map((issue) => {
                        const isError = issue.level === 'error';
                        const codeKey = `warningCodes.${issue.code}` as const;
                        const translated = t(`plan:${codeKey}`, {
                            defaultValue: issue.message,
                        });

                        return (
                            <li
                                key={`${issue.code}-${issue.message}`}
                                className="flex items-start gap-2.5 text-xs rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 sm:p-3.5 shadow-2xs"
                            >
                                <Badge
                                    variant={
                                        isError ? 'destructive' : 'warning'
                                    }
                                    className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md mt-0.5"
                                >
                                    {isError
                                        ? t('plan:warningLevelError')
                                        : t('plan:warningLevelWarn')}
                                </Badge>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <p className="font-semibold text-amber-950 leading-snug break-words">
                                        {translated}
                                    </p>
                                    <p className="text-[10px] text-amber-600/70 font-mono break-all">
                                        {issue.code}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
