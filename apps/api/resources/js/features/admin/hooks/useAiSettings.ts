import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AiConfigPayload, TestPromptResponse } from '../types/admin-types';
import { fetchAiConfigDoc, testAiPrompt } from '../api/admin-ai-api';
import { saveDraft, publishDraft, rollbackVersion } from '../api/admin-api';
import { demoAiPayload } from '../fixtures/demo-ai-settings-fixtures';
import { aiConfigPayloadSchema } from '../schemas/admin-ai-schemas';

export function useAiSettings() {
    const queryClient = useQueryClient();

    const { data: doc, isLoading } = useQuery({
        queryKey: ['admin', 'config', 'ai'],
        queryFn: fetchAiConfigDoc,
    });

    const [draftConfig, setDraftConfig] = useState<AiConfigPayload | null>(
        null,
    );
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isPublishOpen, setIsPublishOpen] = useState<boolean>(false);
    const [isRollbackOpen, setIsRollbackOpen] = useState<boolean>(false);
    const [isTesting, setIsTesting] = useState<boolean>(false);

    // Compute effective config
    const effectiveConfig: AiConfigPayload =
        draftConfig ??
        (() => {
            if (!doc) return demoAiPayload;
            const raw =
                doc.draftVersion?.payload ?? doc.publishedVersion?.payload;
            const parsed = aiConfigPayloadSchema.safeParse(raw);
            return parsed.success ? parsed.data : demoAiPayload;
        })();

    const updateConfig = (
        updater: (prev: AiConfigPayload) => AiConfigPayload,
    ) => {
        setDraftConfig(updater(effectiveConfig));
        setIsDirty(true);
    };

    const toApiPayload = (cfg: AiConfigPayload): Record<string, unknown> => ({
        schemaVersion: cfg.schemaVersion ?? 1,
        provider: cfg.provider,
        model: cfg.model,
        temperature: cfg.temperature,
        maxTokens: cfg.maxTokens,
        dailyLimit: cfg.dailyLimit,
        timeoutSeconds: cfg.timeoutSeconds,
        enabled: cfg.isEnabled,
        prompts: cfg.prompts,
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const etag = doc?.draftVersion?.etag ?? null;
            await saveDraft(
                'ai',
                toApiPayload(effectiveConfig),
                'AI Settings Draft',
                etag,
            );
        },
        onSuccess: () => {
            setIsDirty(false);
            void queryClient.invalidateQueries({
                queryKey: ['admin', 'config', 'ai'],
            });
        },
    });

    const publishMutation = useMutation({
        mutationFn: async (label: string) => {
            if (isDirty)
                await saveDraft(
                    'ai',
                    toApiPayload(effectiveConfig),
                    'AI Settings Draft',
                );
            await publishDraft('ai', label || null);
        },
        onSuccess: () => {
            setIsPublishOpen(false);
            setIsDirty(false);
            void queryClient.invalidateQueries({
                queryKey: ['admin', 'config', 'ai'],
            });
        },
    });

    const rollbackMutation = useMutation({
        mutationFn: async (version: number) => {
            await rollbackVersion('ai', version);
        },
        onSuccess: () => {
            setIsRollbackOpen(false);
            setIsDirty(false);
            setDraftConfig(null);
            void queryClient.invalidateQueries({
                queryKey: ['admin', 'config', 'ai'],
            });
        },
    });

    const runTest = async (
        which: 'constraints' | 'commentary',
        prompt: string,
        answers: Record<string, unknown>,
    ): Promise<TestPromptResponse> => {
        setIsTesting(true);
        try {
            return await testAiPrompt({ which, prompt, answers });
        } finally {
            setIsTesting(false);
        }
    };

    return {
        doc: doc ?? null,
        isLoading,
        config: effectiveConfig,
        isDirty,
        isTesting,
        isPublishOpen,
        isRollbackOpen,
        isSaving: saveMutation.isPending,
        isPublishing: publishMutation.isPending,
        isRollingBack: rollbackMutation.isPending,
        updateConfig,
        saveDraft: () => {
            saveMutation.mutate();
        },
        publishDraft: (label: string) => {
            publishMutation.mutate(label);
        },
        rollbackVersion: (ver: number) => {
            rollbackMutation.mutate(ver);
        },
        openPublish: () => {
            setIsPublishOpen(true);
        },
        closePublish: () => {
            setIsPublishOpen(false);
        },
        openRollback: () => {
            setIsRollbackOpen(true);
        },
        closeRollback: () => {
            setIsRollbackOpen(false);
        },
        runTest,
    };
}
