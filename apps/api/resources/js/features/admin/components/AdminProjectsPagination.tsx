import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type Props = {
    readonly total: number;
    readonly currentPage: number;
    readonly lastPage: number;
    readonly onPageChange: (page: number) => void;
};

export function AdminProjectsPagination({
    total,
    currentPage,
    lastPage,
    onPageChange,
}: Props): React.JSX.Element | null {
    const { t } = useTranslation('admin');
    if (total <= 0) return null;
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            <span>
                {t('paginationTotal', {
                    count: total,
                    current: currentPage,
                    totalPages: lastPage,
                })}
            </span>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        onPageChange(currentPage - 1);
                    }}
                    disabled={currentPage <= 1}
                    className="p-1 h-7 w-7"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 font-mono text-xs">
                    {currentPage} / {lastPage}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        onPageChange(currentPage + 1);
                    }}
                    disabled={currentPage >= lastPage}
                    className="p-1 h-7 w-7"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
