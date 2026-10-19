import { useSyncExternalStore } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { i18n as I18nInstance } from 'i18next';
import { AppProviders } from './providers';
import { AppRoutes } from './AppRoutes';

function subscribeToHash(callback: () => void): () => void {
    window.addEventListener('hashchange', callback);
    return () => {
        window.removeEventListener('hashchange', callback);
    };
}

function getHashSnapshot(): string {
    return window.location.hash;
}

function getServerHashSnapshot(): string {
    return '';
}

export interface AppProps {
    readonly client?: QueryClient | undefined;
    readonly i18n?: I18nInstance | undefined;
}

export function App({ client, i18n }: AppProps): React.JSX.Element {
    const hash = useSyncExternalStore(
        subscribeToHash,
        getHashSnapshot,
        getServerHashSnapshot,
    );

    return (
        <AppProviders client={client} i18n={i18n}>
            <AppRoutes hash={hash} />
        </AppProviders>
    );
}
