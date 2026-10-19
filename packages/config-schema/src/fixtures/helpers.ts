export function makeMinimalField(
    key: string,
    overrides: Record<string, unknown> = {},
): Record<string, unknown> {
    return {
        type: 'text',
        key,
        label: { ja: 'テスト項目' },
        required: false,
        ...overrides,
    };
}

export function makeMinimalSection(
    key: string,
    fields: readonly unknown[] = [makeMinimalField('field_1')],
    overrides: Record<string, unknown> = {},
): Record<string, unknown> {
    return {
        key,
        title: { ja: 'セクションタイトル' },
        fields: [...fields],
        ...overrides,
    };
}

export function makeMinimalStep(
    key: string,
    sectionsOrFields: readonly unknown[] = [makeMinimalField('field_1')],
    overrides: Record<string, unknown> = {},
): Record<string, unknown> {
    const isSections =
        sectionsOrFields.length > 0 &&
        typeof sectionsOrFields[0] === 'object' &&
        sectionsOrFields[0] !== null &&
        'fields' in sectionsOrFields[0];

    const sections = isSections
        ? sectionsOrFields
        : [makeMinimalSection(`${key.slice(0, 30)}_sec`, sectionsOrFields)];

    return {
        key,
        title: { ja: 'ステップタイトル' },
        sections: [...sections],
        ...overrides,
    };
}

export function makeMinimalWizard(
    steps: readonly unknown[] = [makeMinimalStep('step_1')],
    overrides: Record<string, unknown> = {},
): Record<string, unknown> {
    return {
        schemaVersion: 1,
        steps: [...steps],
        ...overrides,
    };
}
