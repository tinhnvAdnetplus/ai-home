import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Step2LandLocationSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step2LandLocationSection({
    answers,
    onAnswerChange,
    isDisabled = false,
    errors = {},
}: Step2LandLocationSectionProps): React.JSX.Element {
    const { t } = useTranslation();

    const locationValue =
        typeof answers.land_location === 'string' ? answers.land_location : '';

    return (
        <div className="w-full">
            <div
                className={cn(
                    'flex h-11 w-full items-center rounded-lg border border-slate-300 bg-white px-3 shadow-2xs transition-all',
                    'hover:border-slate-400 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                    isDisabled && 'opacity-50 pointer-events-none',
                    errors.land_location &&
                        'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
                )}
            >
                <MapPin
                    className="h-5 w-5 shrink-0 text-primary fill-primary"
                    aria-hidden="true"
                />
                <div className="mx-3 h-6 w-px shrink-0 bg-slate-200" />
                <input
                    id="land_location"
                    type="text"
                    value={locationValue}
                    onChange={(e) => {
                        onAnswerChange('land_location', e.target.value);
                    }}
                    disabled={isDisabled}
                    maxLength={100}
                    placeholder={t('wizard:landLocationPlaceholder')}
                    className="flex-1 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 border-0"
                    aria-invalid={errors.land_location ? true : undefined}
                />
            </div>
            {errors.land_location ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.land_location}
                </p>
            ) : null}
        </div>
    );
}
