import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import boundariesPlugin from 'eslint-plugin-boundaries';
import checkFilePlugin from 'eslint-plugin-check-file';
import i18nextPlugin from 'eslint-plugin-i18next';

export default tseslint.config(
    {
        ignores: [
            'public/**',
            'vendor/**',
            'node_modules/**',
            'storage/**',
            'dist/**',
            '.phpunit.cache/**',
            'coverage/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
            boundaries: boundariesPlugin,
            'check-file': checkFilePlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: 'tsconfig.json',
                },
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
            'boundaries/ignore': [
                'resources/js/setupTests.ts',
                '**/*.test.{ts,tsx}',
                '**/*.spec.{ts,tsx}',
                'vite.config.ts',
                'vitest.config.ts',
                'eslint.config.js',
            ],
            'boundaries/elements': [
                {
                    type: 'app',
                    pattern: 'resources/js/app/**',
                },
                {
                    type: 'feature',
                    pattern: 'resources/js/features/*',
                    capture: ['featureName'],
                },
                {
                    type: 'shared',
                    pattern: 'resources/js/shared/**',
                },
            ],
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            ...reactPlugin.configs.flat['jsx-runtime'].rules,
            ...reactHooksPlugin.configs.recommended.rules,
            ...jsxA11yPlugin.flatConfigs.recommended.rules,

            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-definitions': 'off',
            'no-console': 'error',

            // 2. DOM & React conventions
            'react/forbid-dom-props': [
                'error',
                {
                    forbid: [
                        {
                            propName: 'style',
                            message:
                                'Inline style is forbidden. Use Tailwind utility classes instead.',
                        },
                    ],
                },
            ],
            'react/no-danger': 'error',
            'react/no-array-index-key': 'error',
            'react/jsx-no-useless-fragment': 'error',

            // 3. Consistent type assertions (no `as` except `as const`)
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    assertionStyle: 'never',
                },
            ],

            // 4. Ban React.FC / FC / FunctionComponent / VFC
            '@typescript-eslint/no-restricted-types': [
                'error',
                {
                    types: {
                        'React.FC': {
                            message:
                                'Use standard function components with typed props instead of React.FC',
                        },
                        FC: {
                            message:
                                'Use standard function components with typed props instead of FC',
                        },
                        'React.FunctionComponent': {
                            message:
                                'Use standard function components with typed props instead of React.FunctionComponent',
                        },
                        FunctionComponent: {
                            message:
                                'Use standard function components with typed props instead of FunctionComponent',
                        },
                        'React.VFC': {
                            message:
                                'Use standard function components with typed props instead of React.VFC',
                        },
                        VFC: {
                            message:
                                'Use standard function components with typed props instead of VFC',
                        },
                    },
                },
            ],

            // 7. Naming conventions
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
                        regex: '^(asChild|loading|required|aria-.*)$',
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

            // 8. Boundaries rules
            'boundaries/dependencies': [
                'error',
                {
                    default: 'disallow',
                    policies: [
                        {
                            from: { element: { type: 'app' } },
                            allow: [
                                { to: { element: { type: 'app' } } },
                                {
                                    to: {
                                        element: {
                                            type: 'feature',
                                            fileInternalPath: 'index.{ts,tsx}',
                                        },
                                    },
                                },
                                { to: { element: { type: 'shared' } } },
                            ],
                        },
                        {
                            from: { element: { type: 'feature' } },
                            allow: [
                                {
                                    to: {
                                        element: {
                                            type: 'feature',
                                            captured: {
                                                featureName:
                                                    '{{from.featureName}}',
                                            },
                                        },
                                    },
                                },
                                {
                                    to: {
                                        element: {
                                            type: 'feature',
                                            fileInternalPath: 'index.{ts,tsx}',
                                        },
                                    },
                                },
                                { to: { element: { type: 'shared' } } },
                            ],
                        },
                        {
                            from: { element: { type: 'shared' } },
                            allow: [{ to: { element: { type: 'shared' } } }],
                        },
                    ],
                },
            ],
        },
    },
    // 1. Max lines 150 for resources/js except tests
    {
        files: ['resources/js/**/*.{ts,tsx}'],
        ignores: [
            'resources/js/**/*.test.{ts,tsx}',
            'resources/js/**/*.spec.{ts,tsx}',
            'resources/js/setupTests.ts',
        ],
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
    // 4. Ban default exports in resources/js
    {
        files: ['resources/js/**/*.{ts,tsx}'],
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
    // 5. Global fetch restricted to shared/lib/http.ts
    {
        files: ['resources/js/**/*.{ts,tsx}'],
        ignores: ['resources/js/shared/lib/http.ts'],
        rules: {
            'no-restricted-globals': [
                'error',
                {
                    name: 'fetch',
                    message:
                        'Global fetch is allowed ONLY in shared/lib/http.ts. Use the typed http helper or feature api.',
                },
            ],
        },
    },
    // 5b. useEffect / useLayoutEffect forbidden in components and shared/ui
    {
        files: [
            'resources/js/features/**/components/**/*.{ts,tsx}',
            'resources/js/shared/ui/**/*.{ts,tsx}',
        ],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'react',
                            importNames: ['useEffect', 'useLayoutEffect'],
                            message:
                                'useEffect and useLayoutEffect are forbidden in presentational components and shared UI. Use hooks or TanStack Query.',
                        },
                    ],
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "MemberExpression[object.name='React'][property.name=/^(useEffect|useLayoutEffect)$/]",
                    message:
                        'React.useEffect and React.useLayoutEffect are forbidden in presentational components and shared UI.',
                },
            ],
        },
    },
    // 6. File naming conventions
    {
        files: [
            'resources/js/**/components/**/*.{ts,tsx}',
            'resources/js/shared/ui/**/*.{ts,tsx}',
            'resources/js/app/App*.{ts,tsx}',
        ],
        rules: {
            'check-file/filename-naming-convention': [
                'error',
                { '**/*': 'PASCAL_CASE' },
                { ignoreMiddleExtensions: true },
            ],
        },
    },
    {
        files: ['resources/js/**/hooks/**/*.{ts,tsx}'],
        rules: {
            'check-file/filename-naming-convention': [
                'error',
                { '**/*': '@(use*([A-Z]*([a-z0-9]))|use-*)' },
                { ignoreMiddleExtensions: true },
            ],
        },
    },
    {
        files: ['resources/js/**/*.{ts,tsx}'],
        ignores: [
            'resources/js/**/components/**',
            'resources/js/shared/ui/**',
            'resources/js/**/hooks/**',
            'resources/js/app/App*',
            'resources/js/setupTests.ts',
        ],
        rules: {
            'check-file/filename-naming-convention': [
                'error',
                { '**/*': 'KEBAB_CASE' },
                { ignoreMiddleExtensions: true },
            ],
        },
    },
    // 9. Disallow literal string in JSX text and user-facing attributes (i18n enforcement)
    {
        files: ['resources/js/**/*.tsx'],
        ignores: [
            'resources/js/**/*.test.{ts,tsx}',
            'resources/js/**/*.spec.{ts,tsx}',
        ],
        plugins: {
            i18next: i18nextPlugin,
        },
        rules: {
            'i18next/no-literal-string': [
                'error',
                {
                    mode: 'jsx-only',
                    'jsx-attributes': {
                        include: ['aria-label', 'title', 'placeholder', 'alt'],
                    },
                    words: {
                        exclude: [
                            '^[@#§%&+=/\\-—–•:;,.!?()\\[\\]{}*<>~`"\'\\s0-9]+$',
                        ],
                    },
                },
            ],
        },
    },
    // The dev-only showcase (hash #/ui) contains demo labels and is excluded from the production bundle
    {
        files: ['resources/js/app/dev/**/*.{ts,tsx}'],
        rules: {
            'i18next/no-literal-string': 'off',
        },
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        ...tseslint.configs.disableTypeChecked,
    },
);
