import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { type BuildingModel } from '@aihome/bdm';
import { lotOverflow } from '../lib/lot-fit';

/** Says plainly when the house cannot fit the lot, instead of leaving it to the drawing. */
export function LotFitBanner({
    model,
}: {
    readonly model: BuildingModel;
}): React.JSX.Element | null {
    const { t } = useTranslation(['plan']);
    const over = lotOverflow(model);
    if (!over) return null;
    const parts = [
        over.widthM > 0
            ? t('plan:lotFitWidth', { m: over.widthM.toFixed(1) })
            : null,
        over.depthM > 0
            ? t('plan:lotFitDepth', { m: over.depthM.toFixed(1) })
            : null,
    ].filter((p): p is string => p !== null);
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
        >
            <AlertTriangle
                className="h-5 w-5 shrink-0 text-rose-600 mt-0.5"
                aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
                <p className="text-sm font-bold">{t('plan:lotFitTitle')}</p>
                <p className="text-xs leading-relaxed">
                    {t('plan:lotFitBody', { amount: parts.join(' / ') })}
                </p>
            </div>
        </div>
    );
}
