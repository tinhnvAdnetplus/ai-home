import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { Option } from '@aihome/config-schema';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

type FieldOptionRowProps = {
    readonly option: Option;
    readonly index: number;
    readonly totalCount: number;
    readonly onMove: (index: number, direction: 'up' | 'down') => void;
    readonly onRemove: (index: number) => void;
    readonly onUpdate: (index: number, updated: Partial<Option>) => void;
};

export function FieldOptionRow({
    option,
    index,
    totalCount,
    onMove,
    onRemove,
    onUpdate,
}: FieldOptionRowProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-[11px] font-semibold text-slate-500 w-12 shrink-0">
                        {t('optionValue')}:
                    </span>
                    <Input
                        value={option.value}
                        onChange={(e) => {
                            onUpdate(index, { value: e.target.value });
                        }}
                        className="h-8 text-xs bg-white flex-1"
                    />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                            onMove(index, 'up');
                        }}
                        disabled={index === 0}
                        title={t('moveUp')}
                        aria-label={t('moveUp')}
                        className="h-7 w-7 min-h-0 min-w-0"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                            onMove(index, 'down');
                        }}
                        disabled={index === totalCount - 1}
                        title={t('moveDown')}
                        aria-label={t('moveDown')}
                        className="h-7 w-7 min-h-0 min-w-0"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                            onRemove(index);
                        }}
                        title={t('removeOption')}
                        aria-label={t('removeOption')}
                        className="h-7 w-7 min-h-0 min-w-0 text-rose-600 hover:text-rose-700"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                    value={option.label.ja}
                    placeholder={t('labelJa')}
                    onChange={(e) => {
                        onUpdate(index, {
                            label: { ...option.label, ja: e.target.value },
                        });
                    }}
                    className="h-7 text-xs bg-white"
                />
                <Input
                    value={option.label.en ?? ''}
                    placeholder={t('labelEn')}
                    onChange={(e) => {
                        onUpdate(index, {
                            label: { ...option.label, en: e.target.value },
                        });
                    }}
                    className="h-7 text-xs bg-white"
                />
                <Input
                    value={option.label.vi ?? ''}
                    placeholder={t('labelVi')}
                    onChange={(e) => {
                        onUpdate(index, {
                            label: { ...option.label, vi: e.target.value },
                        });
                    }}
                    className="h-7 text-xs bg-white"
                />
            </div>
        </div>
    );
}
