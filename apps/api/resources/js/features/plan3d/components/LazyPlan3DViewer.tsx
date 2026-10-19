import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { type Plan3DViewerProps } from '../types.js';

const Plan3DViewerInner = lazy(async () => {
    const mod = await import('./Plan3DViewer.js');
    return { default: mod.Plan3DViewer };
});

export function LazyPlan3DViewer(props: Plan3DViewerProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <Suspense
            fallback={
                <div className="w-full h-[520px] rounded-2xl bg-slate-100/80 animate-pulse flex items-center justify-center border border-slate-200">
                    <span className="text-xs font-medium text-slate-400">
                        {t('plan3d:loading3d')}
                    </span>
                </div>
            }
        >
            <Plan3DViewerInner {...props} />
        </Suspense>
    );
}
