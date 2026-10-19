export { ProjectsPage } from './components/ProjectsPage';
export { ProjectCard } from './components/ProjectCard';
export {
    ProjectSyncStatus,
    type SyncStatus,
} from './components/ProjectSyncStatus';
export { GuestSaveBanner } from './components/GuestSaveBanner';
export {
    ProjectLoadingState,
    ProjectNotFoundState,
} from './components/ProjectLoadState';
export {
    useProjectSync,
    type UseProjectSyncResult,
} from './hooks/useProjectSync';
export {
    useProjectsList,
    useProject,
    useCreateProject,
    PROJECTS_QUERY_KEY,
} from './hooks/useProjects';
export {
    type Project,
    type PlanProposal,
    type ProjectStatus,
    type ProjectsResponse,
    type CreateProjectInput,
    type UpdateAnswersInput,
    type UploadPlansInput,
    projectSchema,
    planProposalSchema,
} from './schemas/project-schema';
export {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    updateAnswers,
    submitProject,
    uploadPlans,
} from './api/projects-api';
export {
    persistProjectAnswers,
    submitProjectWithPlans,
} from './lib/project-sync-helpers';
