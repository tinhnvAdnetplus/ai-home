import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import { type PlanScore } from '@aihome/planner';

type ScoreSectionProps = {
    readonly score: PlanScore;
};

type ScoreItemProps = {
    readonly label: string;
    readonly value: number;
    readonly isTotal?: boolean | undefined;
};

function ScoreBarItem({
    label,
    value,
    isTotal = false,
}: ScoreItemProps): React.JSX.Element {
    const { t } = useTranslation();
    const clampedVal = Math.min(100, Math.max(0, value));

    const fillColor = isTotal
        ? '#0b6bdc'
        : clampedVal >= 80
          ? '#10b981'
          : clampedVal >= 60
            ? '#0ea5e9'
            : '#f59e0b';

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
                <span
                    className={
                        isTotal
                            ? 'font-bold text-slate-900 text-sm'
                            : 'text-slate-700'
                    }
                >
                    {label}
                </span>
                <span
                    className={
                        isTotal
                            ? 'font-extrabold text-[#0b6bdc] text-base'
                            : 'text-slate-800'
                    }
                >
                    {value.toString()}{' '}
                    <span className="text-[11px] font-normal text-slate-500">
                        {t('plan:points')}
                    </span>
                </span>
            </div>
            <div
                className={
                    isTotal
                        ? 'h-3 w-full rounded-full bg-slate-100 overflow-hidden'
                        : 'h-2 w-full rounded-full bg-slate-100 overflow-hidden'
                }
            >
                <svg
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    className="h-full w-full rounded-full"
                    aria-hidden="true"
                >
                    <rect
                        x="0"
                        y="0"
                        width={clampedVal}
                        height="10"
                        rx="3"
                        fill={fillColor}
                    />
                </svg>
            </div>
        </div>
    );
}

export function ScoreSection({ score }: ScoreSectionProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0b6bdc]">
                    <Award className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('plan:scoreTitle')}
                </h2>
            </div>

            <div className="space-y-3.5">
                <ScoreBarItem
                    label={t('plan:scoreTotal')}
                    value={score.total}
                    isTotal={true}
                />
                <div className="h-px bg-slate-100" />
                <ScoreBarItem
                    label={t('plan:scoreHousework')}
                    value={score.housework}
                />
                <ScoreBarItem
                    label={t('plan:scoreStorage')}
                    value={score.storage}
                />
                <ScoreBarItem
                    label={t('plan:scoreDaylight')}
                    value={score.daylight}
                />
                <ScoreBarItem
                    label={t('plan:scoreBudget')}
                    value={score.budget}
                />
            </div>
        </div>
    );
}
