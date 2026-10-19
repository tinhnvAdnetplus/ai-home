export type StructuralStatus = 'valid' | 'invalid';

export type FixtureCase = {
    readonly slug: string;
    readonly name: string;
    readonly description: string;
    readonly input: unknown;
    readonly structural: StructuralStatus;
    readonly knownDivergence?: string;
};

export type FixtureExpected = {
    readonly ok: boolean;
    readonly codes: readonly string[];
    readonly firstPath?: readonly (string | number)[];
};

export type FixtureFileContent = {
    readonly name: string;
    readonly description: string;
    readonly input: unknown;
    readonly expected: FixtureExpected;
    readonly structural: StructuralStatus;
    readonly knownDivergence?: string;
};
