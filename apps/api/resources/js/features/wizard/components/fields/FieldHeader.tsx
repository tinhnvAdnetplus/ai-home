import { useTranslation } from 'react-i18next';
import { type LocalizedText } from '@aihome/config-schema';
import { useFieldHeaderMode } from '../../lib/field-header-mode';
import { resolveLocalized } from '../../lib/field-helpers';

type FieldHeaderProps = {
    readonly id?: string | undefined;
    readonly label: LocalizedText;
    readonly required?: boolean | undefined;
    readonly help?: LocalizedText | undefined;
};

export function FieldHeader({
    id,
    label,
    required: isRequired = false,
    help,
}: FieldHeaderProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const mode = useFieldHeaderMode();
    const labelText = resolveLocalized(label, i18n.language);
    const helpText = resolveLocalized(help, i18n.language);

    if (mode === 'hidden') {
        return (
            <div className="sr-only">
                <label htmlFor={id}>{labelText}</label>
            </div>
        );
    }

    if (mode === 'sub') {
        return (
            <div className="mb-1.5">
                <label
                    htmlFor={id}
                    className="text-xs xl:text-[15px] font-bold text-slate-700"
                >
                    {labelText}
                </label>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 mb-1.5">
            <div className="flex items-center gap-2">
                <label
                    htmlFor={id}
                    className="text-[13px] font-bold text-brand-950"
                >
                    {labelText}
                </label>
                {isRequired ? (
                    <span className="inline-flex items-center rounded bg-[#fee2e2] px-1.5 py-0.5 text-[10px] font-semibold text-[#ef4444] leading-none">
                        {t('wizard:required')}
                    </span>
                ) : null}
            </div>
            {helpText ? (
                <p className="text-[11px] text-slate-400">{helpText}</p>
            ) : null}
        </div>
    );
}
