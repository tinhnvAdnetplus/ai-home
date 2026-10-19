import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type StepNavRowProps = {
    readonly index: number;
    readonly stepKey: string;
    readonly isDone: boolean;
    readonly isCurrent: boolean;
    readonly isPink: boolean;
    readonly stepTitle: string;
    readonly stepHint: string;
    readonly icon: LucideIcon;
    readonly onSelect: () => void;
};

export function StepNavRow({
    index,
    stepKey,
    isDone,
    isCurrent,
    isPink,
    stepTitle,
    stepHint,
    icon: Icon,
    onSelect,
}: StepNavRowProps): React.JSX.Element {
    return (
        <button
            key={stepKey}
            type="button"
            disabled={!isDone && !isCurrent}
            aria-current={isCurrent ? 'step' : undefined}
            onClick={onSelect}
            className={cn(
                'flex h-[56px] items-center gap-2.5 rounded-2xl px-2.5 text-left transition-all border backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isCurrent
                    ? isPink
                        ? 'border-[#ec3064] bg-white/90 border-l-4 border-l-[#ec3064] shadow-sm'
                        : 'border-[#0b6bdc] bg-white/90 border-l-4 border-l-[#0b6bdc] shadow-sm'
                    : 'border-white/50 bg-white/60 hover:bg-white/75 shadow-xs',
            )}
        >
            <span
                className={cn(
                    'flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-sm font-black text-white',
                    isCurrent && isPink
                        ? 'bg-[#ec3064]'
                        : isDone || isCurrent
                          ? 'bg-[#0b6bdc]'
                          : 'bg-[#cbd5e1]',
                )}
            >
                {index + 1}
            </span>
            <span
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                    isCurrent && isPink
                        ? 'bg-rose-100 text-[#ec3064]'
                        : isDone || isCurrent
                          ? 'bg-sky-100 text-[#0b6bdc]'
                          : 'bg-slate-100/80 text-slate-400',
                )}
            >
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span
                    className={cn(
                        'line-clamp-2 text-[15px] font-bold',
                        isCurrent
                            ? isPink
                                ? 'text-[#ec3064]'
                                : 'text-[#0b6bdc]'
                            : 'text-[#0c243c]',
                    )}
                >
                    {stepTitle}
                </span>
                <span className="truncate text-[11px] text-slate-500 font-medium">
                    {stepHint}
                </span>
            </span>
            {isDone ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0b6bdc] text-white">
                    <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                </span>
            ) : null}
        </button>
    );
}
