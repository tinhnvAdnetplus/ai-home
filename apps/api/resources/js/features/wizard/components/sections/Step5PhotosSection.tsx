import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { type Section } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { STEP5_GALLERY_PHOTOS } from '../../lib/step5-photos';

type Step5PhotosSectionProps = {
    readonly section: Section;
    readonly value: readonly string[];
    readonly onChange: (key: string, value: string[]) => void;
};

export function Step5PhotosSection({
    section,
    value,
    onChange,
}: Step5PhotosSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const field = section.fields[0];
    const options = field && 'options' in field ? field.options : [];

    const handleToggle = (optVal: string): void => {
        if (!field) return;
        const next = value.includes(optVal)
            ? value.filter((v) => v !== optVal)
            : [...value, optVal];
        onChange(field.key, next);
    };

    return (
        <section className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-3 xl:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] xl:col-span-8">
            <header className="flex items-center gap-2 mb-2">
                <h2 className="text-xs xl:text-[14px] font-bold text-slate-900 tracking-tight leading-tight">
                    {resolveLocalized(section.title, i18n.language)}
                </h2>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                {options.map((opt) => {
                    const isSelected = value.includes(opt.value);
                    const photo = STEP5_GALLERY_PHOTOS[opt.value];

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
                                'group relative aspect-[16/10] w-full rounded-lg border overflow-hidden transition-all',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                isSelected
                                    ? 'border-2 border-[#ec3064] shadow-xs'
                                    : 'border-slate-200 hover:border-slate-300',
                            )}
                        >
                            {photo ? (
                                <img
                                    src={photo}
                                    alt=""
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-100" />
                            )}
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'absolute bottom-1.5 left-1.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-[2px] shadow-xs transition-colors',
                                    isSelected
                                        ? 'border border-[#ec3064] bg-[#ec3064] text-white'
                                        : 'border border-slate-300 bg-white/95 text-transparent',
                                )}
                            >
                                {isSelected ? (
                                    <Check
                                        className="h-2.5 w-2.5 stroke-[3]"
                                        aria-hidden="true"
                                    />
                                ) : null}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
