import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function ForbiddenView(): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-7 h-7" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                    {t('forbiddenTitle')}
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {t('forbiddenDescription')}
                </p>
                <div className="pt-2">
                    <Button asChild variant="outline" size="sm">
                        <a
                            href="#/wizard"
                            className="inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToHome')}
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
