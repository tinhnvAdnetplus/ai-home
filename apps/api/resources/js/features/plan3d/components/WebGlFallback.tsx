import type React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

type Props = {
    readonly fallback2DPlan?: React.ReactNode | undefined;
    readonly className?: string | undefined;
};

export function WebGlFallback({
    fallback2DPlan,
    className,
}: Props): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div
            className={`w-full min-h-[420px] rounded-2xl border border-amber-200 bg-amber-50/60 p-6 flex flex-col items-center justify-center text-center space-y-4 ${className ?? ''}`}
        >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-bold text-slate-800">
                    {t('plan3d:webglUnavailableTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t('plan3d:webglUnavailableDescription')}
                </p>
            </div>
            {fallback2DPlan ? (
                <div className="w-full mt-4 bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                    {fallback2DPlan}
                </div>
            ) : null}
        </div>
    );
}
