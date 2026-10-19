import 'i18next';
import type ja from './locales/ja.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: readonly [
            'common',
            'health',
            'errors',
            'wizard',
            'plan',
            'plan3d',
            'auth',
            'projects',
            'admin',
            'ai',
        ];
        resources: typeof ja;
    }
}
