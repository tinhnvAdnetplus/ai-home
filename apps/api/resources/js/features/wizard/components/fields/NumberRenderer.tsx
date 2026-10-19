import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { type Field } from '@aihome/config-schema';
import { Input } from '@/shared/ui/Input';
import { getFieldPrefixIcon } from '../../lib/field-decorations';
import { FieldHeader } from './FieldHeader';
import {
    resolveLocalized,
    type CommonFieldProps,
} from '../../lib/field-helpers';

type NumberField = Extract<Field, { type: 'number' }>;
type Props = CommonFieldProps<NumberField, number>;

const TSUBO_TO_M2 = 3.305785;

export function NumberRenderer({
    field,
    value,
    onChange,
    isDisabled = false,
    error,
}: Props): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const prefixIcon = getFieldPrefixIcon(field.key);

    const hasUnitSwitch =
        field.allowedUnits !== undefined &&
        field.allowedUnits.includes('坪') &&
        field.allowedUnits.includes('m²');

    const [currentUnit, setCurrentUnit] = useState<'坪' | 'm²'>('坪');

    const displayValue =
        value !== undefined
            ? currentUnit === 'm²' && hasUnitSwitch
                ? (Math.round(value * TSUBO_TO_M2 * 10) / 10).toString()
                : value.toString()
            : '';

    const handleInputChange = (raw: string): void => {
        if (raw === '') {
            onChange(0);
            return;
        }
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) {
            return;
        }
        if (hasUnitSwitch && currentUnit === 'm²') {
            const inTsubo = Math.round((parsed / TSUBO_TO_M2) * 10) / 10;
            onChange(inTsubo);
        } else {
            onChange(parsed);
        }
    };

    return (
        <div className="w-full">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div className="flex items-center gap-2">
                {prefixIcon}
                <Input
                    id={id}
                    type="number"
                    value={displayValue}
                    onChange={(e) => {
                        handleInputChange(e.target.value);
                    }}
                    disabled={isDisabled}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    className="flex-1"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                />
                {hasUnitSwitch ? (
                    <div className="relative shrink-0">
                        <select
                            value={currentUnit}
                            onChange={(e) => {
                                const newUnit =
                                    e.target.value === 'm²' ? 'm²' : '坪';
                                setCurrentUnit(newUnit);
                            }}
                            disabled={isDisabled}
                            className="h-11 min-h-[44px] sm:h-10 sm:min-h-0 rounded-lg border border-slate-300 bg-white pl-3 pr-7 text-[16px] sm:text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                        >
                            <option value="坪">{t('wizard:unitTsubo')}</option>
                            <option value="m²">{t('wizard:unitM2')}</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                ) : field.unit ? (
                    <span className="text-sm font-medium text-muted-foreground">
                        {field.unit}
                    </span>
                ) : null}
            </div>
            {field.help ? (
                <p className="mt-1.5 text-xs text-slate-500">
                    {resolveLocalized(field.help, i18n.language)}
                </p>
            ) : null}
            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="mt-1 text-xs text-destructive"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}
