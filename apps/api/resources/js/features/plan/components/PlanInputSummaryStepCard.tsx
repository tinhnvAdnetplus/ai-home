import { useTranslation } from 'react-i18next';
import { type validatedDefaultWizard } from '@/features/wizard';
import { resolveText, formatValue } from '../lib/plan-input-summary-utils';

type StepItem = (typeof validatedDefaultWizard.steps)[number];

type PlanInputSummaryStepCardProps = {
    readonly step: StepItem;
    readonly lang: string;
    readonly answers: Record<string, unknown>;
};

export function PlanInputSummaryStepCard({
    step,
    lang,
    answers,
}: PlanInputSummaryStepCardProps): React.JSX.Element {
    const { t } = useTranslation();
    const stepTitle = resolveText(step.title, lang);
    const fields = step.sections.flatMap((s) => s.fields);

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                {stepTitle}
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200/60">
                <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y divide-slate-100">
                        {fields.map((f, i) => {
                            const fieldLabel =
                                resolveText(f.label, lang) || f.key;
                            const rawVal = answers[f.key];
                            const formatted = formatValue(rawVal, t);

                            return (
                                <tr
                                    key={f.key}
                                    className={
                                        i % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-slate-50/50'
                                    }
                                >
                                    <th className="py-2 px-3 sm:px-4 font-semibold text-slate-700 w-2/5">
                                        {fieldLabel}
                                    </th>
                                    <td className="py-2 px-3 sm:px-4 text-slate-900 font-medium">
                                        {formatted}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
