import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import type { ProjectStatus } from '../schemas/project-schema';

export interface ProjectStatusBadgesProps {
    readonly status: ProjectStatus;
    readonly plansCount: number;
}

export function ProjectStatusBadges({
    status,
    plansCount,
}: ProjectStatusBadgesProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {status === 'draft' ? (
                <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 font-semibold text-xs px-2.5 py-0.5"
                >
                    {t('projects:statusDraft')}
                </Badge>
            ) : null}

            {status === 'submitted' ? (
                <Badge
                    variant="default"
                    className="bg-[#0b6bdc] text-white font-semibold text-xs px-2.5 py-0.5"
                >
                    {t('projects:statusSubmitted')}
                </Badge>
            ) : null}

            {status === 'archived' ? (
                <Badge
                    variant="outline"
                    className="text-slate-500 font-semibold text-xs px-2.5 py-0.5"
                >
                    {t('projects:statusArchived')}
                </Badge>
            ) : null}

            {plansCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Layers className="h-3 w-3" aria-hidden="true" />
                    {t('projects:plansCount', { count: plansCount })}
                </span>
            ) : null}
        </div>
    );
}
