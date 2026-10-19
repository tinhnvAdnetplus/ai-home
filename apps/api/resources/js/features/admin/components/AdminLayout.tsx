import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Settings,
    FileSpreadsheet,
    History,
    Sparkles,
    ArrowLeft,
    ShieldAlert,
    Sliders,
    FolderKanban,
} from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import type { AdminNavTab } from '../types/admin-types';

type AdminLayoutProps = {
    readonly activeTab: AdminNavTab;
    readonly onSelectTab: (tab: AdminNavTab) => void;
    readonly isDemo: boolean;
    readonly children: ReactNode;
};

export function AdminLayout({
    activeTab,
    onSelectTab,
    isDemo,
    children,
}: AdminLayoutProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    const navItems: readonly {
        readonly tab: AdminNavTab;
        readonly label: string;
        readonly icon: typeof Settings;
    }[] = [
        { tab: 'configs', label: t('navConfigs'), icon: Settings },
        { tab: 'wizard', label: t('navWizard'), icon: FileSpreadsheet },
        { tab: 'versions', label: t('navVersions'), icon: History },
        { tab: 'ai-settings', label: t('navAiSettings'), icon: Sliders },
        { tab: 'ai-usage', label: t('navAiUsage'), icon: Sparkles },
        { tab: 'projects', label: t('navProjects'), icon: FolderKanban },
    ];

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
                <div>
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-base text-slate-900 tracking-tight">
                                {t('title')}
                            </span>
                        </div>
                        {isDemo && (
                            <Badge
                                variant="warning"
                                className="self-start text-[11px] py-0.5 px-2"
                            >
                                <ShieldAlert className="w-3 h-3 mr-1 inline" />
                                {t('demoBadge')}
                            </Badge>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="p-3 space-y-1" aria-label={t('title')}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.tab;
                            return (
                                <button
                                    key={item.tab}
                                    type="button"
                                    onClick={() => {
                                        onSelectTab(item.tab);
                                    }}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                                    />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <LanguageSwitcher />
                        <a
                            href="#/wizard"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors p-1"
                            title={t('backToHome')}
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{t('backToHome')}</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
                {isDemo && (
                    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 flex items-center justify-between">
                        <span>{t('demoNotice')}</span>
                    </div>
                )}
                <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
