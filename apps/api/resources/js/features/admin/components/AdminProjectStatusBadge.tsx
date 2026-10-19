import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';

type Props = { readonly status: string };

export function AdminProjectStatusBadge({ status }: Props): React.JSX.Element {
    const { t } = useTranslation('admin');
    switch (status) {
        case 'completed':
            return (
                <Badge variant="success" className="text-xs">
                    {t('statusCompleted')}
                </Badge>
            );
        case 'submitted':
            return (
                <Badge variant="secondary" className="text-xs">
                    {t('statusSubmitted')}
                </Badge>
            );
        case 'archived':
            return (
                <Badge variant="outline" className="text-xs">
                    {t('statusArchived')}
                </Badge>
            );
        default:
            return (
                <Badge variant="warning" className="text-xs">
                    {t('statusDraft')}
                </Badge>
            );
    }
}
