import { useState, useMemo } from 'react';
import {
    parseWizardConfig,
    type WizardConfig,
    type Field,
} from '@aihome/config-schema';
import type {
    WizardValidationResult,
    ConfigDocumentDetail,
} from '../types/admin-types';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isWizardConfigLike(val: unknown): val is WizardConfig {
    if (!isRecord(val)) return false;
    if (val.schemaVersion !== 1) return false;
    if (!Array.isArray(val.steps)) return false;
    for (const step of val.steps) {
        if (!isRecord(step) || !Array.isArray(step.sections)) return false;
    }
    return true;
}

export function extractInitialConfig(
    detail: ConfigDocumentDetail | null,
): WizardConfig | null {
    const raw =
        detail?.draftVersion?.payload ?? detail?.publishedVersion?.payload;
    if (!raw) return null;
    const res = parseWizardConfig(raw);
    if (res.ok) return res.data;
    if (isWizardConfigLike(raw)) return raw;
    return null;
}

export function useWizardDraft(
    initialConfig: WizardConfig | null,
    initialViewMode: 'visual' | 'raw' = 'visual',
) {
    const [draftConfig, setDraftConfig] = useState<WizardConfig | null>(
        initialConfig,
    );
    const [isDirty, setIsDirty] = useState(false);
    const [selectedStepIndex, setSelectedStepIndex] = useState(0);
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
    const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(
        null,
    );
    const [viewMode, setViewMode] = useState<'visual' | 'raw'>(initialViewMode);
    const [rawJson, setRawJson] = useState(() =>
        initialConfig ? JSON.stringify(initialConfig, null, 2) : '',
    );

    const validation: WizardValidationResult = useMemo(() => {
        if (!draftConfig) {
            return { isValid: false, issues: [], parsedConfig: null };
        }
        const result = parseWizardConfig(draftConfig);
        if (result.ok) {
            return { isValid: true, issues: [], parsedConfig: result.data };
        }
        return { isValid: false, issues: result.issues, parsedConfig: null };
    }, [draftConfig]);

    const selectField = (stepIdx: number, secIdx: number, fieldKey: string) => {
        setSelectedStepIndex(stepIdx);
        setSelectedSectionIndex(secIdx);
        setSelectedFieldKey(fieldKey);
    };

    const updateField = (updatedField: Field) => {
        if (!draftConfig) return;

        const newSteps = draftConfig.steps.map((step, sIdx) => {
            if (sIdx !== selectedStepIndex) return step;
            const newSections = step.sections.map((sec, secIdx) => {
                if (secIdx !== selectedSectionIndex) return sec;
                const newFields = sec.fields.map((f) =>
                    f.key === updatedField.key ? updatedField : f,
                );
                return { ...sec, fields: newFields };
            });
            return { ...step, sections: newSections };
        });

        const newConfig = { ...draftConfig, steps: newSteps };
        setDraftConfig(newConfig);
        setRawJson(JSON.stringify(newConfig, null, 2));
        setIsDirty(true);
    };

    const applyRawJson = (newJson: string): boolean => {
        setRawJson(newJson);
        try {
            const parsed: unknown = JSON.parse(newJson);
            const res = parseWizardConfig(parsed);
            if (res.ok) {
                setDraftConfig(res.data);
                setIsDirty(true);
                return true;
            }
            if (isWizardConfigLike(parsed)) {
                setDraftConfig(parsed);
                setIsDirty(true);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    return {
        draftConfig,
        setDraftConfig,
        isDirty,
        setIsDirty,
        selectedStepIndex,
        selectedSectionIndex,
        selectedFieldKey,
        selectField,
        updateField,
        viewMode,
        setViewMode,
        rawJson,
        applyRawJson,
        validation,
    };
}
