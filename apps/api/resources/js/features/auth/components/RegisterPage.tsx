import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { RegisterForm } from './RegisterForm';

export function RegisterPage(): React.JSX.Element {
    const { t } = useTranslation();

    const handleSuccess = (): void => {
        window.location.hash = '#/projects';
    };

    return (
        <div className="min-h-screen bg-[#f0f4f9] text-foreground flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans">
            <header className="mx-auto w-full max-w-md flex items-center justify-between mb-4">
                <a
                    href="#/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#0b6bdc] transition-colors min-h-[44px]"
                >
                    <Home
                        className="h-4 w-4 text-[#0b6bdc]"
                        aria-hidden="true"
                    />
                    <span>{t('common:appName')}</span>
                </a>
                <LanguageSwitcher />
            </header>

            <main className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center">
                <div className="rounded-[24px] bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {t('auth:registerTitle')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {t('auth:registerSubtitle')}
                        </p>
                    </div>

                    <RegisterForm onSuccess={handleSuccess} />

                    <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                        <p className="text-xs text-slate-600">
                            {t('auth:hasAccount')}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.hash = '#/login';
                                }}
                                className="font-semibold text-[#0b6bdc] hover:underline min-h-[44px] inline-flex items-center"
                            >
                                {t('auth:loginLink')}
                            </button>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="mx-auto w-full max-w-md text-center py-4 text-xs text-slate-400">
                {t('common:appName')}
            </footer>
        </div>
    );
}
