import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { i18n as I18nInstance } from 'i18next';
import { type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '../shared/i18n/init';

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });
}

type Props = {
    readonly children: ReactNode;
    readonly client?: QueryClient | undefined;
    readonly i18n?: I18nInstance | undefined;
};

export function AppProviders({
    children,
    client,
    i18n,
}: Props): React.JSX.Element {
    const [queryClient] = useState<QueryClient>(
        () => client ?? createQueryClient(),
    );
    const [i18nInstance] = useState<I18nInstance>(() => i18n ?? initI18n());

    return (
        <I18nextProvider i18n={i18nInstance}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </I18nextProvider>
    );
}
