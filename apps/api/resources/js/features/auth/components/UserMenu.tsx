import { useTranslation } from 'react-i18next';
import {
    User as UserIcon,
    LogOut,
    FolderKanban,
    PlusCircle,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useSession } from '../hooks/useSession';
import { useDropdownMenu } from '../hooks/useDropdownMenu';

export function UserMenu(): React.JSX.Element {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout, isLoggingOut } = useSession();
    const { isOpen, toggle, close, menuRef } = useDropdownMenu();

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        window.location.hash = '#/login';
                    }}
                    className="min-h-[44px] rounded-full border-slate-300 font-medium text-slate-700 hover:bg-slate-100"
                >
                    <UserIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    <span>{t('auth:login')}</span>
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        window.location.hash = '#/register';
                    }}
                    className="min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-medium shadow-xs"
                >
                    <span>{t('auth:register')}</span>
                </Button>
            </div>
        );
    }

    const handleLogout = async (): Promise<void> => {
        close();
        try {
            await logout();
            window.location.hash = '#/login';
        } catch {
            // Ignore logout errors
        }
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[#0b6bdc]">
                    <UserIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="max-w-[120px] truncate sm:max-w-[180px]">
                    {user.name}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen ? (
                <div
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none"
                >
                    <div className="border-b border-slate-100 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user.email}
                        </p>
                        <div className="mt-1">
                            <Badge
                                variant="secondary"
                                className="text-[10px] uppercase"
                            >
                                {user.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="py-1">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                close();
                                window.location.hash = '#/projects';
                            }}
                            className="flex w-full min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors"
                        >
                            <FolderKanban
                                className="h-4 w-4 text-slate-500"
                                aria-hidden="true"
                            />
                            <span>{t('auth:myProjects')}</span>
                        </button>

                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                close();
                                window.location.hash = '#/wizard';
                            }}
                            className="flex w-full min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors"
                        >
                            <PlusCircle
                                className="h-4 w-4 text-slate-500"
                                aria-hidden="true"
                            />
                            <span>{t('auth:newPlan')}</span>
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                        <button
                            type="button"
                            role="menuitem"
                            disabled={isLoggingOut}
                            onClick={() => {
                                void handleLogout();
                            }}
                            className="flex w-full min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors disabled:opacity-50"
                        >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            <span>
                                {isLoggingOut
                                    ? t('auth:loggingOut')
                                    : t('auth:logout')}
                            </span>
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
