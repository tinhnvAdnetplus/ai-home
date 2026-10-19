import { useTranslation } from 'react-i18next';

type Props = {
    readonly message?: string;
};

export function HealthSkeleton({ message }: Props): React.JSX.Element {
    const { t } = useTranslation();
    const displayMessage = message ?? t('health:loading');

    return (
        <div
            role="status"
            className="p-6 bg-slate-900 rounded-lg text-center text-slate-300"
        >
            <p className="text-sm m-0">{displayMessage}</p>
        </div>
    );
}
