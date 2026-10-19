import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import checkFilePlugin from 'eslint-plugin-check-file';

export default tseslint.config(
    {
        ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'check-file': checkFilePlugin,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-definitions': 'off',
            'no-console': 'error',

            // No `as` assertions except `as const`
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    assertionStyle: 'never',
                },
            ],

            // Naming conventions
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                {
                    selector: 'variable',
                    types: ['boolean'],
                    format: ['PascalCase'],
                    prefix: ['is', 'has', 'can', 'should', 'will', 'did'],
                },
                {
                    selector: 'parameter',
                    types: ['boolean'],
                    format: ['PascalCase'],
                    prefix: ['is', 'has', 'can', 'should', 'will', 'did'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: [
                        'classProperty',
                        'objectLiteralProperty',
                        'typeProperty',
                        'classMethod',
                        'objectLiteralMethod',
                        'typeMethod',
                        'accessor',
                        'enumMember',
                    ],
                    format: null,
                    modifiers: ['requiresQuotes'],
                },
                {
                    selector: ['classProperty', 'typeProperty'],
                    types: ['boolean'],
                    format: ['PascalCase'],
                    prefix: ['is', 'has', 'can', 'should', 'will', 'did'],
                    filter: {
                        regex: '^(ok|required|multiple|showCounter)$',
                        match: false,
                    },
                },
                {
                    selector: 'objectLiteralProperty',
                    format: null,
                },
                {
                    selector: 'import',
                    format: null,
                },
            ],

            // Kebab-case filenames
            'check-file/filename-naming-convention': [
                'error',
                { '**/*': 'KEBAB_CASE' },
                { ignoreMiddleExtensions: true },
            ],
        },
    },
    // Named exports only in src/
    {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-exports': [
                'error',
                {
                    restrictDefaultExports: {
                        direct: true,
                        named: true,
                        defaultFrom: true,
                        namedFrom: true,
                        namespaceFrom: true,
                    },
                },
            ],
        },
    },
    // Max lines 150 for non-test files
    {
        files: ['src/**/*.ts'],
        ignores: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        rules: {
            'max-lines': [
                'error',
                {
                    max: 150,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
        },
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        ...tseslint.configs.disableTypeChecked,
    },
);
