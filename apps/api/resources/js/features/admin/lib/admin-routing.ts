import type { AdminNavTab, AdminViewMode } from '../types/admin-types';

export type AdminRouteState = {
    readonly tab: AdminNavTab;
    readonly viewMode: AdminViewMode;
    readonly dialog: 'publish' | 'rollback' | null;
    readonly subTab: 'versions' | 'audit';
};

export function parseAdminHash(rawHash: string): AdminRouteState {
    const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
    const [pathPart, queryPart] = hash.split('?');
    const path = pathPart ?? '';
    const params = new URLSearchParams(queryPart ?? '');

    let tab: AdminNavTab = 'configs';
    if (
        path === '/admin/wizard' ||
        path.startsWith('/admin/wizard/') ||
        path === '/admin/raw-json' ||
        path === '/admin/publish-dialog' ||
        path === '/admin/rollback-dialog' ||
        params.get('tab') === 'wizard'
    ) {
        tab = 'wizard';
    } else if (
        path === '/admin/versions' ||
        path.startsWith('/admin/versions/') ||
        path === '/admin/audit' ||
        params.get('tab') === 'versions'
    ) {
        tab = 'versions';
    } else if (
        path === '/admin/ai-usage' ||
        path.startsWith('/admin/ai-usage/') ||
        params.get('tab') === 'ai-usage' ||
        params.get('view') === 'ai-usage'
    ) {
        tab = 'ai-usage';
    } else if (
        path === '/admin/ai-settings' ||
        path.startsWith('/admin/ai-settings/') ||
        params.get('tab') === 'ai-settings'
    ) {
        tab = 'ai-settings';
    } else if (
        path === '/admin/projects' ||
        path.startsWith('/admin/projects/') ||
        params.get('tab') === 'projects'
    ) {
        tab = 'projects';
    } else if (
        path === '/admin/configs' ||
        path.startsWith('/admin/configs/') ||
        params.get('tab') === 'configs'
    ) {
        tab = 'configs';
    }

    let viewMode: AdminViewMode = 'visual';
    if (
        path === '/admin/raw-json' ||
        params.get('view') === 'raw' ||
        params.get('viewMode') === 'raw'
    ) {
        viewMode = 'raw';
    }

    let dialog: 'publish' | 'rollback' | null = null;
    if (
        path === '/admin/publish-dialog' ||
        params.get('dialog') === 'publish' ||
        params.get('modal') === 'publish'
    ) {
        dialog = 'publish';
    } else if (
        path === '/admin/rollback-dialog' ||
        params.get('dialog') === 'rollback' ||
        params.get('modal') === 'rollback'
    ) {
        dialog = 'rollback';
    }

    let subTab: 'versions' | 'audit' = 'versions';
    if (
        path === '/admin/audit' ||
        params.get('subtab') === 'audit' ||
        params.get('tab') === 'audit'
    ) {
        subTab = 'audit';
    }

    return {
        tab,
        viewMode,
        dialog,
        subTab,
    };
}

export function formatAdminHash(tab: AdminNavTab, isDemo: boolean): string {
    const query = isDemo ? '?demo=1' : '';
    if (tab === 'configs') return `#/admin/configs${query}`;
    if (tab === 'wizard') return `#/admin/wizard${query}`;
    if (tab === 'versions') return `#/admin/versions${query}`;
    if (tab === 'ai-usage') return `#/admin/ai-usage${query}`;
    if (tab === 'ai-settings') return `#/admin/ai-settings${query}`;
    return `#/admin/projects${query}`;
}
