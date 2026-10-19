import { useTranslation } from 'react-i18next';

type PlanCostLoanSimInputsProps = {
    readonly downMan: number;
    readonly ratePercent: number;
    readonly years: number;
    readonly onDownManChange: (val: number) => void;
    readonly onRatePercentChange: (val: number) => void;
    readonly onYearsChange: (val: number) => void;
};

export function PlanCostLoanSimInputs({
    downMan,
    ratePercent,
    years,
    onDownManChange,
    onRatePercentChange,
    onYearsChange,
}: PlanCostLoanSimInputsProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
                <label
                    htmlFor="loan-down-input"
                    className="text-xs font-semibold text-slate-700 block"
                >
                    {t('plan:loanDownPayment')}
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 flex items-center px-3 py-2">
                    <input
                        id="loan-down-input"
                        type="number"
                        min={0}
                        step={50}
                        value={downMan}
                        onChange={(e) => {
                            onDownManChange(
                                Math.max(0, Number(e.target.value) || 0),
                            );
                        }}
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                    />
                    <span className="text-xs text-slate-500 shrink-0 font-medium">
                        {t('plan:unitManYen')}
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="loan-rate-input"
                    className="text-xs font-semibold text-slate-700 block"
                >
                    {t('plan:loanInterestRate')}
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 flex items-center px-3 py-2">
                    <input
                        id="loan-rate-input"
                        type="number"
                        min={0}
                        max={5}
                        step={0.05}
                        value={ratePercent}
                        onChange={(e) => {
                            onRatePercentChange(
                                Math.max(0, Number(e.target.value) || 0),
                            );
                        }}
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                    />
                    <span className="text-xs text-slate-500 shrink-0 font-medium">
                        %
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="loan-years-input"
                    className="text-xs font-semibold text-slate-700 block"
                >
                    {t('plan:loanYears')}
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 flex items-center px-3 py-2">
                    <input
                        id="loan-years-input"
                        type="number"
                        min={5}
                        max={50}
                        step={1}
                        value={years}
                        onChange={(e) => {
                            onYearsChange(
                                Math.max(5, Number(e.target.value) || 35),
                            );
                        }}
                        className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                    />
                    <span className="text-xs text-slate-500 shrink-0 font-medium">
                        {t('plan:unitYears')}
                    </span>
                </div>
            </div>
        </div>
    );
}
