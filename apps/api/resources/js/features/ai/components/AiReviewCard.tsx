import { useTranslation } from 'react-i18next';
import { HelpCircle, Lightbulb, Scale, TriangleAlert } from 'lucide-react';
import { type ProgramReview } from '../lib/program-review';
import { AiReviewChangeLine } from './AiReviewChangeLine';

/**
 * What the review changed in the customer's wishes and why, the design advice, and what the
 * customer should confirm. Hidden when the review had nothing to say.
 */
export function AiReviewCard({
    review,
}: {
    readonly review: ProgramReview | undefined;
}): React.JSX.Element | null {
    const { t } = useTranslation();
    if (!review) return null;
    const { adjustments, suggestions, questions, summary } = review;
    const isNotFitting = !review.isFeasible;
    if (
        adjustments.length === 0 &&
        suggestions.length === 0 &&
        questions.length === 0 &&
        !isNotFitting
    ) {
        return null;
    }

    return (
        <section
            aria-labelledby="ai-review-title"
            className="rounded-[24px] border border-violet-100 bg-linear-to-br from-violet-50/50 via-white to-blue-50/30 p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0"
        >
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Scale className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                    <h2
                        id="ai-review-title"
                        className="text-sm sm:text-base font-bold text-slate-900"
                    >
                        {t('ai:reviewTitle')}
                    </h2>
                    <span className="text-[11px] text-slate-500">
                        {t('ai:reviewSubtitle')}
                    </span>
                </div>
            </div>

            {summary !== '' ? (
                <p className="text-sm leading-relaxed text-slate-800">
                    {summary}
                </p>
            ) : null}

            {isNotFitting ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-900">
                    <TriangleAlert
                        className="h-4 w-4 shrink-0 text-rose-600 mt-0.5"
                        aria-hidden="true"
                    />
                    <div className="space-y-1">
                        <p className="font-semibold">
                            {t('ai:reviewNotFitting')}
                        </p>
                        {review.issues.map((i) => (
                            <p key={i.code}>{i.message}</p>
                        ))}
                    </div>
                </div>
            ) : null}

            {adjustments.length > 0 ? (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700">
                        {t('ai:reviewChangesTitle')}
                    </h3>
                    <ul className="space-y-2">
                        {adjustments.map((a) => (
                            <AiReviewChangeLine
                                key={`${a.action}-${a.field}-${a.value}`}
                                adj={a}
                            />
                        ))}
                    </ul>
                </div>
            ) : null}

            {suggestions.length > 0 ? (
                <div className="space-y-1.5">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Lightbulb
                            className="h-3.5 w-3.5 text-amber-500"
                            aria-hidden="true"
                        />
                        {t('ai:reviewSuggestionsTitle')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed text-slate-700">
                        {suggestions.map((s) => (
                            <li key={s}>{s}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {questions.length > 0 ? (
                <div className="space-y-1.5">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <HelpCircle
                            className="h-3.5 w-3.5 text-[#0b6bdc]"
                            aria-hidden="true"
                        />
                        {t('ai:reviewQuestionsTitle')}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed text-slate-700">
                        {questions.map((q) => (
                            <li key={q}>{q}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </section>
    );
}
