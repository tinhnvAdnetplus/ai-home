import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type WizardConfig } from '@aihome/config-schema';
import { validatedDefaultWizard } from '../data/load-wizard';
import {
    computeWizardHash,
    hasStoredDraftAnswers,
} from '../lib/wizard-storage';
import { fetchWizardConfig } from '../api/wizard-config-api';

export type WizardConfigSource = 'api' | 'bundled';
export type ConfigSourceMode = 'bundled' | 'api' | 'auto';

export type UseWizardConfigOptions = {
    readonly hasStartedAnswering?: boolean | undefined;
};

export type UseWizardConfigResult = {
    readonly wizard: WizardConfig;
    readonly source: WizardConfigSource;
    readonly configHash: string;
    readonly version: number | null;
    readonly isLoading: boolean;
};

export function getConfigSourceMode(): ConfigSourceMode {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
        const params = new URLSearchParams(window.location.search);
        const queryOverride = params.get('configSource');
        if (
            queryOverride === 'bundled' ||
            queryOverride === 'api' ||
            queryOverride === 'auto'
        ) {
            return queryOverride;
        }
    }
    const envVal: unknown = import.meta.env.VITE_CONFIG_SOURCE;
    if (envVal === 'bundled' || envVal === 'api' || envVal === 'auto') {
        return envVal;
    }
    return 'auto';
}

export function useWizardConfig(
    options?: UseWizardConfigOptions,
): UseWizardConfigResult {
    const sourceMode = getConfigSourceMode();
    const bundledWizard = validatedDefaultWizard;
    const bundledHash = useMemo(
        () => computeWizardHash(bundledWizard),
        [bundledWizard],
    );

    const isApiFetchEnabled = sourceMode !== 'bundled';

    const query = useQuery({
        queryKey: ['config', 'bundle', 'wizard'],
        queryFn: ({ signal }) => fetchWizardConfig(signal),
        enabled: isApiFetchEnabled,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const hasInitialDraft = useMemo(
        () => hasStoredDraftAnswers(bundledHash),
        [bundledHash],
    );

    const [hasUserStartedBundled, setHasUserStartedBundled] =
        useState<boolean>(hasInitialDraft);

    const hasStartedOption = options?.hasStartedAnswering;

    if (
        !hasUserStartedBundled &&
        hasStartedOption &&
        (query.isLoading || query.data === undefined)
    ) {
        setHasUserStartedBundled(true);
    }

    const apiResult = query.data;
    const canAdoptApi =
        !hasUserStartedBundled &&
        apiResult !== null &&
        apiResult !== undefined &&
        !query.isError;

    if (canAdoptApi) {
        const apiWizard = apiResult.wizard;
        const apiHash = computeWizardHash(apiWizard);
        return {
            wizard: apiWizard,
            source: 'api',
            configHash: apiHash,
            version: apiResult.version,
            isLoading: false,
        };
    }

    if (apiResult !== null && apiResult !== undefined && !query.isError) {
        const apiWizard = apiResult.wizard;
        const apiHash = computeWizardHash(apiWizard);
        if (apiHash === bundledHash) {
            return {
                wizard: apiWizard,
                source: 'api',
                configHash: apiHash,
                version: apiResult.version,
                isLoading: false,
            };
        }
    }

    return {
        wizard: bundledWizard,
        source: 'bundled',
        configHash: bundledHash,
        version: null,
        isLoading: query.isLoading && isApiFetchEnabled,
    };
}
