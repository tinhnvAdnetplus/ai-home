import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

type Step2RoadWidthSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step2RoadWidthSection({
    answers,
    onAnswerChange,
    isDisabled = false,
    errors = {},
}: Step2RoadWidthSectionProps): React.JSX.Element {
    const { t } = useTranslation();

    const rawVal =
        typeof answers.road_width === 'number'
            ? answers.road_width.toString()
            : typeof answers.road_width === 'string'
              ? answers.road_width
              : '';

    const handleNumberChange = (raw: string): void => {
        if (raw === '') {
            onAnswerChange('road_width', undefined);
            return;
        }
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) {
            onAnswerChange('road_width', parsed);
        }
    };

    return (
        <div className="flex flex-col justify-between h-full w-full">
            <div>
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'flex h-11 min-h-[44px] flex-1 items-center rounded-lg border border-slate-300 bg-white px-3 shadow-2xs transition-all',
                            'hover:border-slate-400 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                            isDisabled && 'opacity-50 pointer-events-none',
                            errors.road_width &&
                                'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
                        )}
                    >
                        {/* Road Icon with perspective & dashes */}
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5 shrink-0 text-primary"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M3.5 20L7.5 4H9.5L7 20H3.5Z"
                                fill="currentColor"
                            />
                            <path
                                d="M20.5 20L16.5 4H14.5L17 20H20.5Z"
                                fill="currentColor"
                            />
                            <line
                                x1="12"
                                y1="4.5"
                                x2="12"
                                y2="7.5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <line
                                x1="12"
                                y1="10.5"
                                x2="12"
                                y2="13.5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <line
                                x1="12"
                                y1="16.5"
                                x2="12"
                                y2="19.5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="mx-2.5 h-6 w-px shrink-0 bg-slate-200" />

                        <input
                            id="road_width"
                            type="number"
                            value={rawVal}
                            onChange={(e) => {
                                handleNumberChange(e.target.value);
                            }}
                            min={2}
                            max={20}
                            step={0.5}
                            disabled={isDisabled}
                            className="flex-1 bg-transparent p-0 text-[16px] sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-invalid={errors.road_width ? true : undefined}
                        />
                    </div>
                    <span className="text-xs xl:text-sm font-medium text-slate-600 shrink-0">
                        {t('wizard:unitMeters')}
                    </span>
                </div>

                <div className="mt-2 text-xs text-slate-500 leading-tight">
                    <p>{t('wizard:roadWidthExample')}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {t('wizard:roadWidthBlankHint')}
                    </p>
                </div>
            </div>

            {errors.road_width ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.road_width}
                </p>
            ) : null}
        </div>
    );
}
