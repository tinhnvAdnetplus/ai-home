import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export function PlanDisclaimerFlow(): React.JSX.Element {
    const { t } = useTranslation();

    const steps = [
        {
            no: '1',
            title: t('plan:flowStep1Title'),
            desc: t('plan:flowStep1Desc'),
            done: true,
        },
        {
            no: '2',
            title: t('plan:flowStep2Title'),
            desc: t('plan:flowStep2Desc'),
            done: true,
        },
        {
            no: '3',
            title: t('plan:flowStep3Title'),
            desc: t('plan:flowStep3Desc'),
            done: false,
        },
        {
            no: '4',
            title: t('plan:flowStep4Title'),
            desc: t('plan:flowStep4Desc'),
            done: false,
        },
    ];

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {t('plan:flowTitle')}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t('plan:flowSubtitle')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {steps.map((s) => (
                    <div
                        key={s.no}
                        className={`rounded-2xl border p-3.5 space-y-2 relative transition-all ${
                            s.done
                                ? 'border-emerald-200 bg-emerald-50/40 text-slate-900'
                                : 'border-slate-200/80 bg-slate-50/50 text-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                                    s.done
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                                {s.no}
                            </span>
                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    s.done
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-200/70 text-slate-600'
                                }`}
                            >
                                {s.done
                                    ? t('plan:flowStatusDone')
                                    : t('plan:flowStatusNext')}
                            </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {s.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            {s.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 sm:p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle
                    className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                />
                <p className="leading-relaxed">{t('plan:flowLegalNotice')}</p>
            </div>
        </div>
    );
}
