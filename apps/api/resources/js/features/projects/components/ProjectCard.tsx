import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Trash2, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import type { Project } from '../schemas/project-schema';
import { formatProjectDate } from '../lib/project-sync-helpers';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { ProjectStatusBadges } from './ProjectStatusBadges';

export interface ProjectCardProps {
    readonly project: Project;
    readonly onDelete: (id: number) => Promise<void>;
    readonly isDeleting?: boolean | undefined;
}

export function ProjectCard({
    project,
    onDelete,
    isDeleting = false,
}: ProjectCardProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeletingLocal, setIsDeletingLocal] = useState(false);

    const isSubmitted = project.status === 'submitted';
    const formattedDate = formatProjectDate(project.updated_at, i18n.language);

    const handleContinue = (): void => {
        if (isSubmitted) {
            window.location.hash = `#/wizard?result=1&project=${project.id.toString()}`;
        } else {
            window.location.hash = `#/wizard?project=${project.id.toString()}`;
        }
    };

    const handleDelete = async (): Promise<void> => {
        setIsDeletingLocal(true);
        try {
            await onDelete(project.id);
            setIsConfirmOpen(false);
        } finally {
            setIsDeletingLocal(false);
        }
    };

    const projectTitle = project.title || t('projects:untitledProject');

    return (
        <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
            <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                        <ProjectStatusBadges
                            status={project.status}
                            plansCount={project.plans.length}
                        />
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                            {projectTitle}
                        </h3>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0b6bdc]">
                        <Home className="h-5 w-5" aria-hidden="true" />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
                    <Calendar
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        {t('projects:updatedAt', { date: formattedDate })}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setIsConfirmOpen(true);
                    }}
                    className="min-h-[44px] text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl px-3"
                    aria-label={`${t('projects:delete')} ${projectTitle}`}
                >
                    <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                    <span>{t('projects:delete')}</span>
                </Button>

                <Button
                    type="button"
                    onClick={handleContinue}
                    className="min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-bold text-sm px-4 shadow-xs"
                >
                    <span>
                        {isSubmitted
                            ? t('projects:viewResults')
                            : t('projects:continue')}
                    </span>
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Button>
            </div>

            <DeleteProjectDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                projectTitle={projectTitle}
                onConfirm={handleDelete}
                isDeleting={isDeleting || isDeletingLocal}
            />
        </div>
    );
}
