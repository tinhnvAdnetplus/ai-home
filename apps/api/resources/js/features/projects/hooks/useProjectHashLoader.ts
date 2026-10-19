import { useEffect, useState, useRef } from 'react';
import { fetchProject } from '../api/projects-api';
import {
    getProjectIdFromHash,
    seedLocalStorageWithDraft,
} from '../lib/project-sync-helpers';

export interface UseProjectHashLoaderResult {
    readonly projectId: number | null;
    readonly setProjectId: React.Dispatch<React.SetStateAction<number | null>>;
    readonly loadedAnswers: Record<string, unknown> | null;
    readonly isProjectLoading: boolean;
    readonly projectError: string | null;
    readonly initialAnswersRef: React.MutableRefObject<Record<
        string,
        unknown
    > | null>;
    readonly hasInitializedRef: React.MutableRefObject<boolean>;
}

export function useProjectHashLoader(
    stepIndex = 0,
    onLoaded?: (answers: Record<string, unknown>) => void,
): UseProjectHashLoaderResult {
    const [projectId, setProjectId] = useState<number | null>(() =>
        getProjectIdFromHash(),
    );
    const [loadedAnswers, setLoadedAnswers] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState<boolean>(
        () => getProjectIdFromHash() !== null,
    );
    const [projectError, setProjectError] = useState<string | null>(null);

    const initialAnswersRef = useRef<Record<string, unknown> | null>(null);
    const hasInitializedRef = useRef<boolean>(false);

    useEffect(() => {
        const idFromUrl = getProjectIdFromHash();
        if (idFromUrl === null) return;

        let isMounted = true;
        fetchProject(idFromUrl)
            .then((project) => {
                if (!isMounted) return;
                setProjectId(project.id);
                if (project.answers) {
                    setLoadedAnswers(project.answers);
                    initialAnswersRef.current = project.answers;
                    seedLocalStorageWithDraft(project.answers, stepIndex);
                    onLoaded?.(project.answers);
                }
                hasInitializedRef.current = true;
                setIsProjectLoading(false);
            })
            .catch(() => {
                if (!isMounted) return;
                setProjectError('not_found');
                setIsProjectLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [stepIndex, onLoaded]);

    return {
        projectId,
        setProjectId,
        loadedAnswers,
        isProjectLoading,
        projectError,
        initialAnswersRef,
        hasInitializedRef,
    };
}
