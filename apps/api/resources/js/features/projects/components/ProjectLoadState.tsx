import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function ProjectLoadingState(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center justify-center p-4">
            <Loader2
                className="h-8 w-8 animate-spin text-[#0b6bdc] mb-3"
                aria-hidden="true"
            />
            <p className="text-sm font-medium text-slate-600">
                {t('projects:loading')}
            </p>
        </div>
    );
}

export function ProjectNotFoundState(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-[24px] bg-white p-8 text-center shadow-sm border border-slate-200/80">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
                    <AlertCircle className="h-7 w-7" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {t('projects:notFoundTitle')}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                    {t('projects:notFoundDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            window.location.hash = '#/projects';
                        }}
                        className="min-h-[44px] rounded-xl"
                    >
                        <span>{t('projects:backToProjects')}</span>
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            window.location.hash = '#/wizard';
                            window.location.reload();
                        }}
                        className="min-h-[44px] rounded-xl bg-[#0b6bdc] hover:bg-[#0958b5] text-white"
                    >
                        <span>{t('projects:backToWizard')}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
