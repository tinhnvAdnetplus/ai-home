import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/Input';
import { Step2FrontageDepthDiagram } from './Step2FrontageDepthDiagram';

type Step2FrontageDepthSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step2FrontageDepthSection({
    answers,
    onAnswerChange,
    isDisabled = false,
    errors = {},
}: Step2FrontageDepthSectionProps): React.JSX.Element {
    const { t } = useTranslation();

    const frontageValue =
        typeof answers.frontage === 'number'
            ? answers.frontage.toString()
            : typeof answers.frontage === 'string'
              ? answers.frontage
              : '';

    const depthValue =
        typeof answers.depth === 'number'
            ? answers.depth.toString()
            : typeof answers.depth === 'string'
              ? answers.depth
              : '';

    const handleNumberChange = (key: string, raw: string): void => {
        if (raw === '') {
            // Clearing the field unsets the answer; 0 would be saved as an
            // out-of-range value and the API rejects the whole draft.
            onAnswerChange(key, undefined);
            return;
        }
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) {
            onAnswerChange(key, parsed);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <Step2FrontageDepthDiagram />

            {/* Right stacked inputs */}
            <div className="flex-1 w-full flex flex-col gap-2.5">
                {/* Row 1: 間口 (幅) */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="frontage"
                        className="w-20 sm:w-24 shrink-0 text-xs font-bold text-slate-700"
                    >
                        {t('wizard:plotFrontageWidth')}
                    </label>
                    <div className="flex items-center gap-1.5 flex-1">
                        <Input
                            id="frontage"
                            type="number"
                            value={frontageValue}
                            onChange={(e) => {
                                handleNumberChange('frontage', e.target.value);
                            }}
                            disabled={isDisabled}
                            min={3}
                            max={50}
                            step={0.5}
                            className="flex-1 max-w-[130px] h-11 min-h-[44px] sm:h-10 sm:min-h-0 bg-white border-slate-300 text-[16px] sm:text-sm"
                            aria-invalid={errors.frontage ? true : undefined}
                        />
                        <span className="text-xs font-medium text-slate-600">
                            {t('wizard:unitMeters')}
                        </span>
                    </div>
                </div>
                {errors.frontage ? (
                    <p role="alert" className="text-xs text-destructive">
                        {errors.frontage}
                    </p>
                ) : null}

                {/* Row 2: 奥行き */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="depth"
                        className="w-20 sm:w-24 shrink-0 text-xs font-bold text-slate-700"
                    >
                        {t('wizard:plotDepth')}
                    </label>
                    <div className="flex items-center gap-1.5 flex-1">
                        <Input
                            id="depth"
                            type="number"
                            value={depthValue}
                            onChange={(e) => {
                                handleNumberChange('depth', e.target.value);
                            }}
                            disabled={isDisabled}
                            min={3}
                            max={50}
                            step={0.5}
                            className="flex-1 max-w-[130px] h-11 min-h-[44px] sm:h-10 sm:min-h-0 bg-white border-slate-300 text-[16px] sm:text-sm"
                            aria-invalid={errors.depth ? true : undefined}
                        />
                        <span className="text-xs font-medium text-slate-600">
                            {t('wizard:unitMeters')}
                        </span>
                    </div>
                </div>
                {errors.depth ? (
                    <p role="alert" className="text-xs text-destructive">
                        {errors.depth}
                    </p>
                ) : null}

                {/* Footnote */}
                <p className="text-xs text-slate-400 mt-0.5">
                    {t('wizard:plotFrontageDepthFootnote')}
                </p>
            </div>
        </div>
    );
}
