import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type PlanErrorIssue = {
    readonly code?: string | undefined;
    readonly message: string;
};

type PlanErrorStateProps = {
    readonly issues?: readonly PlanErrorIssue[] | undefined;
    readonly onBack?: (() => void) | undefined;
    readonly title?: string | undefined;
    readonly message?: string | undefined;
};

export function PlanErrorState({
    issues,
    onBack,
    title,
    message,
}: PlanErrorStateProps): React.JSX.Element {
    const { t } = useTranslation();

    const displayTitle = title ?? t('plan:errorTitle');
    const displayMessage = message ?? t('plan:generationFailed');

    const handleBack = (): void => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    };

    return (
        <div className="mx-auto max-w-lg py-8 sm:py-12 px-3 sm:px-4 text-center w-full min-w-0">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <AlertCircle className="h-7 w-7" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {displayTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {displayMessage}
                    </p>
                </div>

                {issues && issues.length > 0 ? (
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5 sm:p-4 text-left space-y-1.5">
                        <span className="text-[11px] font-semibold text-amber-900 block">
                            {t('plan:issuesDetected', { count: issues.length })}
                        </span>
                        <ul className="space-y-1.5 text-xs text-amber-800">
                            {issues.map((issue, idx) => (
                                <li
                                    key={`issue-${idx.toString()}`}
                                    className="flex items-start gap-1.5"
                                >
                                    <span className="text-amber-500 font-bold shrink-0">
                                        •
                                    </span>
                                    <span className="break-words">
                                        {issue.message}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <div className="pt-2">
                    <Button
                        type="button"
                        variant="default"
                        size="default"
                        onClick={handleBack}
                        className="rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white px-6 font-semibold shadow-xs"
                    >
                        <ArrowLeft
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                        />
                        {t('plan:backToWizard')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
