import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { type Section, type LocalizedText } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { DEFAULT_SWATCH_STYLE, SWATCH_STYLES } from '../../lib/step5-swatches';

type Step5MaterialsSectionProps = {
    readonly section: Section;
    readonly floorValue: string;
    readonly wallValue: string;
    readonly onChange: (key: string, value: string) => void;
};

type OptionItem = {
    readonly value: string;
    readonly label: LocalizedText;
};

function MaterialGrid({
    label,
    options,
    value,
    onSelect,
    stylePrefix,
    lang,
}: {
    readonly label: string;
    readonly options: readonly OptionItem[];
    readonly value: string;
    readonly onSelect: (val: string) => void;
    readonly stylePrefix: 'floor_' | 'wall_';
    readonly lang: string;
}): React.JSX.Element {
    return (
        <div>
            <p className="text-[10.5px] xl:text-[11px] font-bold text-slate-700 mb-1 leading-tight">
                {label}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {options.map((opt) => {
                    const isSelected = value === opt.value;
                    const styleKey = `${stylePrefix}${opt.value}`;
                    const swatchBg =
                        SWATCH_STYLES[styleKey] ?? DEFAULT_SWATCH_STYLE;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => {
                                onSelect(opt.value);
                            }}
                            className="flex flex-col items-center group cursor-pointer focus-visible:outline-none min-h-[44px] justify-center"
                        >
                            <div
                                className={cn(
                                    'relative h-8 sm:h-8.5 w-full rounded-[5px] border shadow-2xs flex items-center justify-center transition-all',
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
                            <span className="text-xs sm:text-[9.5px] font-medium text-slate-600 mt-1 leading-tight text-center truncate w-full">
                                {resolveLocalized(opt.label, lang)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function Step5MaterialsSection({
    section,
    floorValue,
    wallValue,
    onChange,
}: Step5MaterialsSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const floorField = section.fields.find(
        (f) => f.key === 'design_flooring_material',
    );
    const wallField = section.fields.find((f) => f.key === 'design_wall_color');

    return (
        <section className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 xl:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] xl:col-span-4">
            <header className="flex items-center gap-2 mb-1.5">
                <h2 className="text-xs xl:text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
                    {resolveLocalized(section.title, i18n.language)}
                </h2>
            </header>
            <div className="flex flex-col gap-2">
                {floorField && 'options' in floorField ? (
                    <MaterialGrid
                        label={resolveLocalized(
                            floorField.label,
                            i18n.language,
                        )}
                        options={floorField.options}
                        value={floorValue}
                        onSelect={(val) => {
                            onChange('design_flooring_material', val);
                        }}
                        stylePrefix="floor_"
                        lang={i18n.language}
                    />
                ) : null}
                {wallField && 'options' in wallField ? (
                    <MaterialGrid
                        label={resolveLocalized(wallField.label, i18n.language)}
                        options={wallField.options}
                        value={wallValue}
                        onSelect={(val) => {
                            onChange('design_wall_color', val);
                        }}
                        stylePrefix="wall_"
                        lang={i18n.language}
                    />
                ) : null}
            </div>
        </section>
    );
}
