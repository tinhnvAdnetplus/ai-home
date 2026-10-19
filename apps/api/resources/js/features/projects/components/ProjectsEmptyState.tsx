import { useTranslation } from 'react-i18next';
import { FolderKanban, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export interface ProjectsEmptyStateProps {
    readonly onCreateNew: () => void;
}

export function ProjectsEmptyState({
    onCreateNew,
}: ProjectsEmptyStateProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="rounded-[24px] bg-white p-8 sm:p-12 text-center shadow-sm border border-slate-200/80 max-w-xl mx-auto my-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-[#0b6bdc] mb-4">
                <FolderKanban className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
                {t('projects:emptyTitle')}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                {t('projects:emptyDescription')}
            </p>
            <Button
                type="button"
                size="lg"
                onClick={onCreateNew}
                className="min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-bold text-sm sm:text-base shadow-md px-6"
            >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{t('projects:createNew')}</span>
            </Button>
        </div>
    );
}
