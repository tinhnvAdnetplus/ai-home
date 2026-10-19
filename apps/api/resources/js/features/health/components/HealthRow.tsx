type Props = {
    readonly label: string;
    readonly value: string;
    readonly isSuccess?: boolean;
    readonly isMonospace?: boolean;
};

export function HealthRow({
    label,
    value,
    isSuccess,
    isMonospace,
}: Props): React.JSX.Element {
    let valueColorClass = 'text-slate-200';
    if (isSuccess === true) {
        valueColorClass = 'text-green-400';
    } else if (isSuccess === false) {
        valueColorClass = 'text-red-400';
    }

    return (
        <div className="flex justify-between items-center p-3.5 bg-slate-900 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-sm">{label}</span>
            <span
                className={
                    isMonospace === true
                        ? 'font-mono text-xs text-slate-200'
                        : `font-semibold text-sm uppercase ${valueColorClass}`
                }
            >
                {value}
            </span>
        </div>
    );
}
