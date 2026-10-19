import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/shared/ui/Card';
import type { ConfigDocumentSummary, AdminNavTab } from '../types/admin-types';
import { DocumentTable } from './DocumentTable';

type DocumentListPageProps = {
    readonly documents: readonly ConfigDocumentSummary[];
    readonly isLoading: boolean;
    readonly onRefresh: () => void;
    readonly onSelectTab: (tab: AdminNavTab) => void;
};

export function DocumentListPage({
    documents,
    isLoading,
    onRefresh,
    onSelectTab,
}: DocumentListPageProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t('documentsTitle')}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('documentsSubtitle')}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    aria-label={t('refresh')}
                >
                    <RefreshCw
                        className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    {t('refresh')}
                </Button>
            </div>

            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-6">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                        {t('documentsTitle')}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                        {t('documentsSubtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <DocumentTable
                        documents={documents}
                        onSelectTab={onSelectTab}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
