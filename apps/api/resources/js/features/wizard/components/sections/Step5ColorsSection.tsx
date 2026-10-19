import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { type Section, type LocalizedText } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { DEFAULT_SWATCH_STYLE, SWATCH_STYLES } from '../../lib/step5-swatches';

type Step5ColorsSectionProps = {
    readonly section: Section;
    readonly wallValue: readonly string[];
    readonly roofValue: readonly string[];
    readonly onChange: (key: string, value: string[]) => void;
};

type OptionItem = {
    readonly value: string;
    readonly label: LocalizedText;
};

function SwatchGrid({
    label,
    options,
    value,
    onToggle,
    lang,
}: {
    readonly label: string;
    readonly options: readonly OptionItem[];
    readonly value: readonly string[];
    readonly onToggle: (val: string) => void;
    readonly lang: string;
}): React.JSX.Element {
    return (
        <div>
            <p className="text-[10.5px] xl:text-[11px] font-bold text-slate-700 mb-1 leading-tight">
                {label}
            </p>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 items-start">
                {options.map((opt, index) => {
                    const isSelected = value.includes(opt.value);
                    const swatchBg =
                        SWATCH_STYLES[opt.value] ?? DEFAULT_SWATCH_STYLE;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            role="checkbox"
                            aria-checked={isSelected}
                            onClick={() => {
                                onToggle(opt.value);
                            }}
                            className="flex flex-col items-center group cursor-pointer focus-visible:outline-none min-h-[44px] min-w-[36px] justify-center"
                        >
                            <div
                                className={cn(
                                    'relative h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-[5px] border shadow-2xs flex items-center justify-center transition-all',
                                    isSelected
                                        ? 'bg-[#ec3064] border-[#ec3064] shadow-xs'
                                        : swatchBg,
                                )}
                            >
                                {isSelected ? (
                                    <Check
                                        className="h-3.5 w-3.5 stroke-[3] text-white"
                                        aria-hidden="true"
                                    />
                                ) : null}
                            </div>
                            <span
                                className={cn(
                                    'text-xs sm:text-[9.5px] font-medium text-slate-600 mt-1 leading-tight text-center truncate w-full',
                                    index === 0 && 'invisible',
                                )}
                            >
                                {resolveLocalized(opt.label, lang)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function Step5ColorsSection({
    section,
    wallValue,
    roofValue,
    onChange,
}: Step5ColorsSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const wallField = section.fields.find(
        (f) => f.key === 'design_exterior_wall_color',
    );
    const roofField = section.fields.find((f) => f.key === 'design_roof_color');

    const toggle = (
        key: string,
        current: readonly string[],
        val: string,
    ): void => {
        const next = current.includes(val)
            ? current.filter((v) => v !== val)
            : [...current, val];
        onChange(key, next);
    };

    return (
        <section className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 xl:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] xl:col-span-4">
            <header className="flex items-center gap-2 mb-1.5">
                <h2 className="text-xs xl:text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
                    {resolveLocalized(section.title, i18n.language)}
                </h2>
            </header>
            <div className="flex flex-col gap-2">
                {wallField && 'options' in wallField ? (
                    <SwatchGrid
                        label={resolveLocalized(wallField.label, i18n.language)}
                        options={wallField.options}
                        value={wallValue}
                        onToggle={(val) => {
                            toggle(
                                'design_exterior_wall_color',
                                wallValue,
                                val,
                            );
                        }}
                        lang={i18n.language}
                    />
                ) : null}
                {roofField && 'options' in roofField ? (
                    <SwatchGrid
                        label={resolveLocalized(roofField.label, i18n.language)}
                        options={roofField.options}
                        value={roofValue}
                        onToggle={(val) => {
                            toggle('design_roof_color', roofValue, val);
                        }}
                        lang={i18n.language}
                    />
                ) : null}
            </div>
        </section>
    );
}
