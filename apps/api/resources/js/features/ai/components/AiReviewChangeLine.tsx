import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { type AppliedAdjustment } from '@aihome/planner';
import { Badge } from '@/shared/ui/Badge';

/** One change: the wish, what it became, who changed it, and why. */
export function AiReviewChangeLine({
    adj,
}: {
    readonly adj: AppliedAdjustment;
}): React.JSX.Element {
    const { t } = useTranslation();
    const change =
        adj.action === 'remove'
            ? t('ai:reviewRemoved', { item: adj.value })
            : adj.action === 'add'
              ? t('ai:reviewAdded', { item: adj.value })
              : t('ai:reviewChanged', { from: adj.from, to: adj.value });
    return (
        <li className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 space-y-1.5 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-900">
                <span>{adj.wish}</span>
                <ArrowRight
                    className="h-3.5 w-3.5 text-slate-400"
                    aria-hidden="true"
                />
                <span className="text-[#0b6bdc]">{change}</span>
                <Badge
                    variant={adj.source === 'input' ? 'warning' : 'secondary'}
                    className="ml-auto rounded-md text-[10px] px-1.5 py-0.5"
                >
                    {t(
                        adj.source === 'ai'
                            ? 'ai:reviewByAi'
                            : adj.source === 'rule'
                              ? 'ai:reviewByRule'
                              : 'ai:reviewInputFix',
                    )}
                </Badge>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
                {adj.reason}
            </p>
        </li>
    );
}
