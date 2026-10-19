import { useTranslation } from 'react-i18next';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

type ProjectSyncStatusProps = {
    readonly status: SyncStatus;
    readonly className?: string | undefined;
};

export function ProjectSyncStatus({
    status,
    className,
}: ProjectSyncStatusProps): React.JSX.Element | null {
    const { t } = useTranslation();

    if (status === 'idle') {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all shadow-xs border',
                status === 'saving' &&
                    'border-blue-200 bg-blue-50/90 text-[#0b6bdc]',
                status === 'saved' &&
                    'border-emerald-200 bg-emerald-50/90 text-emerald-700',
                status === 'error' &&
                    'border-red-200 bg-red-50/90 text-red-600',
                className,
            )}
        >
            {status === 'saving' ? (
                <>
                    <Loader2
                        className="h-3 w-3 animate-spin shrink-0"
                        aria-hidden="true"
                    />
                    <span>{t('projects:saving')}</span>
                </>
            ) : null}

            {status === 'saved' ? (
                <>
                    <Check
                        className="h-3 w-3 shrink-0 text-emerald-600"
                        aria-hidden="true"
                    />
                    <span>{t('projects:saved')}</span>
                </>
            ) : null}

            {status === 'error' ? (
                <>
                    <AlertCircle
                        className="h-3 w-3 shrink-0 text-red-600"
                        aria-hidden="true"
                    />
                    <span>{t('projects:saveError')}</span>
                </>
            ) : null}
        </div>
    );
}
