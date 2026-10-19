import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../i18n/error-message';

type Props = {
    readonly error: unknown;
    readonly resetErrorBoundary: () => void;
};

export function ErrorFallback({
    error,
    resetErrorBoundary,
}: Props): React.JSX.Element {
    const { t } = useTranslation();
    const errorMessage = getErrorMessage(error, t);

    return (
        <div
            role="alert"
            className="p-5 bg-red-950/40 border border-red-500 rounded-lg text-red-200"
        >
            <h2 className="text-base font-semibold mb-2 text-red-300">
                {t('errors:title')}
            </h2>
            <p className="text-sm mb-4 text-red-200">{errorMessage}</p>
            <button
                type="button"
                onClick={resetErrorBoundary}
                className="min-h-[44px] min-w-[44px] px-4 py-2 bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900 text-white font-medium text-sm rounded-md transition-colors cursor-pointer"
            >
                {t('common:retry')}
            </button>
        </div>
    );
}
