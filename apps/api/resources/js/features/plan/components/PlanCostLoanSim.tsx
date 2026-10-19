import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator } from 'lucide-react';
import { calculateLoanPayment } from '../lib/plan-cost';
import { DEFAULT_LOAN_PARAMS } from '../lib/plan-cost-rates';
import { PlanCostLoanSimInputs } from './PlanCostLoanSimInputs';

type PlanCostLoanSimProps = {
    readonly totalMan: number;
};

export function PlanCostLoanSim({
    totalMan,
}: PlanCostLoanSimProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const [downMan, setDownMan] = useState<number>(DEFAULT_LOAN_PARAMS.downMan);
    const [ratePercent, setRatePercent] = useState<number>(
        DEFAULT_LOAN_PARAMS.ratePercent,
    );
    const [years, setYears] = useState<number>(DEFAULT_LOAN_PARAMS.years);

    const loanResult = useMemo(
        () => calculateLoanPayment(totalMan, downMan, ratePercent, years),
        [totalMan, downMan, ratePercent, years],
    );

    const borrowPrincipalMan = Math.max(0, totalMan - downMan);

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0b6bdc]">
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('plan:loanSimTitle')}
                </h3>
            </div>

            <PlanCostLoanSimInputs
                downMan={downMan}
                ratePercent={ratePercent}
                years={years}
                onDownManChange={setDownMan}
                onRatePercentChange={setRatePercent}
                onYearsChange={setYears}
            />

            <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <span className="text-xs text-[#0b6bdc] font-semibold block">
                        {t('plan:loanMonthlyPayment')}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                            {loanResult.monthlyPayment.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                            {t('plan:unitYenPerMonth')}
                        </span>
                    </div>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 border-t sm:border-t-0 sm:border-l border-blue-200/60 pt-2 sm:pt-0 sm:pl-4">
                    <div>
                        <span className="text-slate-500">
                            {t('plan:loanBorrowAmount')}:{' '}
                        </span>
                        <span className="font-bold text-slate-800">
                            {borrowPrincipalMan.toLocaleString()}{' '}
                            {t('plan:unitManYen')}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">
                            {t('plan:loanTotalPayment')}:{' '}
                        </span>
                        <span className="font-bold text-slate-800">
                            {Math.round(
                                loanResult.totalPayment / 10000,
                            ).toLocaleString()}{' '}
                            {t('plan:unitManYen')}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-[11px] text-slate-400">
                {t('plan:loanDisclaimerNote')}
            </p>
        </div>
    );
}
