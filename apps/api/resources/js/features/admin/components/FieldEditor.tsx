import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import type { Field, Option, LocalizedText } from '@aihome/config-schema';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Checkbox } from '@/shared/ui/Checkbox';
import { FieldOptionsEditor } from './FieldOptionsEditor';
import { FieldHelpEditor } from './FieldHelpEditor';
import { FieldVisibleWhen } from './FieldVisibleWhen';

type FieldEditorProps = {
    readonly field: Field | null;
    readonly onFieldChange: (updated: Field) => void;
};

const LANG_OPTIONS: readonly ('ja' | 'en' | 'vi')[] = ['ja', 'en', 'vi'];
const LANG_KEYS = { ja: 'labelJa', en: 'labelEn', vi: 'labelVi' } as const;

export function FieldEditor({
    field,
    onFieldChange,
}: FieldEditorProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [labelTab, setLabelTab] = useState<'ja' | 'en' | 'vi'>('ja');

    if (!field) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
                <Settings2 className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm">{t('noFieldSelected')}</p>
            </div>
        );
    }

    const currentLabel = field.label;
    const handleLabelChange = (lang: 'ja' | 'en' | 'vi', value: string) => {
        onFieldChange({ ...field, label: { ...currentLabel, [lang]: value } });
    };

    const handleHelpChange = (updatedHelp: LocalizedText | undefined) => {
        onFieldChange({ ...field, help: updatedHelp });
    };

    const handleOptionsChange = (newOptions: readonly Option[]) => {
        if (field.type === 'image_select') {
            const options = newOptions.map((opt) => ({
                ...opt,
                image: opt.image ?? {
                    mediaId: 'default',
                    alt: { ja: opt.label.ja },
                },
            }));
            onFieldChange({ ...field, options });
        } else if ('options' in field) {
            onFieldChange({ ...field, options: [...newOptions] });
        }
    };

    const hasOptions = 'options' in field;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                    <span className="text-xs font-semibold text-slate-400">
                        {t('fieldKey')}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                        {field.key}
                    </h2>
                </div>
                <Badge
                    variant="outline"
                    className="uppercase font-mono text-xs px-2.5 py-1"
                >
                    {field.type}
                </Badge>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {t('labelTabs')}
                    </Label>
                    <div className="flex bg-slate-100 p-0.5 rounded-md text-xs">
                        {LANG_OPTIONS.map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                    setLabelTab(lang);
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    labelTab === lang
                                        ? 'bg-white text-blue-700 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {t(LANG_KEYS[lang])}
                            </button>
                        ))}
                    </div>
                </div>
                <Input
                    value={currentLabel[labelTab] ?? ''}
                    onChange={(e) => {
                        handleLabelChange(labelTab, e.target.value);
                    }}
                    placeholder={t(LANG_KEYS[labelTab])}
                    className="text-sm bg-white"
                />
            </div>

            <FieldHelpEditor help={field.help} onChange={handleHelpChange} />

            <div className="flex items-center gap-2 pt-1">
                <Checkbox
                    id="field-required"
                    checked={field.required}
                    onCheckedChange={(checked) => {
                        onFieldChange({ ...field, required: checked === true });
                    }}
                />
                <Label
                    htmlFor="field-required"
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                    {t('requiredLabel')}
                </Label>
            </div>

            {hasOptions && (
                <FieldOptionsEditor
                    options={field.options}
                    onOptionsChange={handleOptionsChange}
                />
            )}

            <FieldVisibleWhen visibleWhen={field.visibleWhen} />
        </div>
    );
}
