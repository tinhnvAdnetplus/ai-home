import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Home } from 'lucide-react';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { extractErrorMessage } from '@/shared/api';
import { useSession } from '../hooks/useSession';
import { loginInputSchema, type LoginInput } from '../schemas/auth-schema';
import { LoginForm } from './LoginForm';

function getRedirectTarget(): string {
    if (typeof window === 'undefined') return '#/projects';
    const hash = window.location.hash;
    const match = /[?&]redirect=([^&]+)/.exec(hash);
    if (match?.[1]) {
        try {
            const decoded = decodeURIComponent(match[1]);
            return decoded.startsWith('#') ? decoded : `#${decoded}`;
        } catch {
            return '#/projects';
        }
    }
    return '#/projects';
}

function resolveDevHint(): string | null {
    if (!import.meta.env.DEV) {
        return null;
    }
    const rawHint: unknown = import.meta.env.VITE_DEV_LOGIN_HINT;
    if (typeof rawHint === 'string' && rawHint.trim() !== '') {
        return rawHint;
    }
    return null;
}

export function LoginPage(): React.JSX.Element {
    const { t } = useTranslation();
    const { login, isLoggingIn } = useSession();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const devHint = resolveDevHint();

    const handleFormSubmit = async (data: LoginInput): Promise<void> => {
        setErrorMessage(null);

        const parseResult = loginInputSchema.safeParse(data);
        if (!parseResult.success) {
            setErrorMessage(t('auth:errors.validationError'));
            return;
        }

        try {
            await login(parseResult.data);
            const target = getRedirectTarget();
            window.location.hash = target;
        } catch (err: unknown) {
            const msg = extractErrorMessage(
                err,
                t('auth:errors.invalidCredentials'),
            );
            setErrorMessage(msg);
        }
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
                            {t('auth:loginTitle')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {t('auth:loginSubtitle')}
                        </p>
                    </div>

                    {errorMessage ? (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                        >
                            <AlertCircle
                                className="h-4 w-4 shrink-0 mt-0.5"
                                aria-hidden="true"
                            />
                            <span>{errorMessage}</span>
                        </div>
                    ) : null}

                    <LoginForm
                        onSubmit={(data) => {
                            void handleFormSubmit(data);
                        }}
                        isSubmitting={isLoggingIn}
                    />

                    {devHint ? (
                        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900">
                            <p className="font-semibold">
                                {t('auth:devHintTitle')}
                            </p>
                            <p className="mt-0.5 text-blue-700 font-mono select-all">
                                {devHint}
                            </p>
                        </div>
                    ) : null}

                    <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                        <p className="text-xs text-slate-600">
                            {t('auth:noAccount')}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.hash = '#/register';
                                }}
                                className="font-semibold text-[#0b6bdc] hover:underline min-h-[44px] inline-flex items-center"
                            >
                                {t('auth:registerLink')}
                            </button>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="mx-auto w-full max-w-md text-center text-xs text-slate-400 mt-6">
                <span>{t('common:appName')}</span>
            </footer>
        </div>
    );
}
