import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { type Section } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import {
    STEP5_EXTERIOR_PHOTOS,
    STEP5_INTERIOR_PHOTOS,
    splitTwoLineLabel,
} from '../../lib/step5-photos';

type Step5StyleSectionProps = {
    readonly section: Section;
    readonly value: readonly string[];
    readonly onChange: (key: string, value: string[]) => void;
    readonly isInterior?: boolean;
};

export function Step5StyleSection({
    section,
    value,
    onChange,
    isInterior = false,
}: Step5StyleSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const field = section.fields[0];
    const options = field && 'options' in field ? field.options : [];
    const photoMap = isInterior ? STEP5_INTERIOR_PHOTOS : STEP5_EXTERIOR_PHOTOS;

    const handleToggle = (optVal: string): void => {
        if (!field) return;
        const next = value.includes(optVal)
            ? value.filter((v) => v !== optVal)
            : [...value, optVal];
        onChange(field.key, next);
    };

    return (
        <section className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 xl:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] w-full">
            <header className="flex items-center gap-2 mb-2">
                <h2 className="text-xs xl:text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
                    {resolveLocalized(section.title, i18n.language)}
                </h2>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 xl:gap-2.5">
                {options.map((opt) => {
                    const isSelected = value.includes(opt.value);
                    const photo = photoMap[opt.value];
                    const rawLabel = resolveLocalized(opt.label, i18n.language);
                    const { title, subtitle } = splitTwoLineLabel(rawLabel);

                    return (
                        <button
                            key={opt.value}
                            type="button"
                            role="checkbox"
                            aria-checked={isSelected}
                            onClick={() => {
                                handleToggle(opt.value);
                            }}
                            className={cn(
                                'group flex flex-col rounded-xl border bg-white overflow-hidden text-left transition-all',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                isSelected
                                    ? 'border-2 border-[#ec3064] shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300',
                            )}
                        >
                            <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 max-h-[66px] xl:max-h-[70px]">
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt=""
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-slate-100" />
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1.5 min-h-[40px] bg-white w-full">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                                        isSelected
                                            ? 'border-[#ec3064] bg-[#ec3064] text-white'
                                            : 'border-slate-300 bg-white',
                                    )}
                                >
                                    {isSelected ? (
                                        <Check
                                            className="h-2.5 w-2.5 stroke-[3]"
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </span>
                                <div className="flex flex-col min-w-0 leading-tight">
                                    <span
                                        className={cn(
                                            'text-[10px] xl:text-[10.5px] truncate',
                                            isSelected
                                                ? 'font-bold text-slate-900'
                                                : 'font-medium text-slate-700',
                                        )}
                                    >
                                        {title}
                                    </span>
                                    {subtitle ? (
                                        <span className="text-[9px] text-slate-500 font-normal truncate">
                                            {subtitle}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
