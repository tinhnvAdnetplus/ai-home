import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import type { Option } from '@aihome/config-schema';
import { Button } from '@/shared/ui/Button';
import { FieldOptionRow } from './FieldOptionRow';

type FieldOptionsEditorProps = {
    readonly options: readonly Option[];
    readonly onOptionsChange: (options: readonly Option[]) => void;
};

export function FieldOptionsEditor({
    options,
    onOptionsChange,
}: FieldOptionsEditorProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= options.length) return;

        const newOptions = [...options];
        const temp = newOptions[index];
        const target = newOptions[targetIndex];
        if (temp !== undefined && target !== undefined) {
            newOptions[index] = target;
            newOptions[targetIndex] = temp;
            onOptionsChange(newOptions);
        }
    };

    const handleRemove = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        onOptionsChange(newOptions);
    };

    const handleAdd = () => {
        const newIndex = options.length + 1;
        const newOpt: Option = {
            value: `option_${newIndex.toString()}`,
            label: {
                ja: `${t('newOptionDefault')} ${newIndex.toString()}`,
                en: `New Option ${newIndex.toString()}`,
                vi: `Tùy chọn mới ${newIndex.toString()}`,
            },
        };
        onOptionsChange([...options, newOpt]);
    };

    const handleUpdateOption = (index: number, updated: Partial<Option>) => {
        const newOptions = options.map((opt, i) => {
            if (i !== index) return opt;
            return {
                ...opt,
                ...updated,
                label: {
                    ...opt.label,
                    ...(updated.label ?? {}),
                },
            };
        });
        onOptionsChange(newOptions);
    };

    return (
        <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('optionsTitle')} ({options.length.toString()})
                </span>
                <Button size="sm" variant="outline" onClick={handleAdd}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t('addOption')}
                </Button>
            </div>

            <div className="space-y-2">
                {options.map((opt, idx) => (
                    <FieldOptionRow
                        key={opt.value}
                        option={opt}
                        index={idx}
                        totalCount={options.length}
                        onMove={handleMove}
                        onRemove={handleRemove}
                        onUpdate={handleUpdateOption}
                    />
                ))}
            </div>
        </div>
    );
}
