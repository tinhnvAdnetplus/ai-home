import { lazy, Suspense } from 'react';
import { AppShell } from './AppShell';

const DevShowcase = import.meta.env.DEV
    ? lazy(async () => {
          const mod = await import('./dev/dev-showcase');
          return { default: mod.DevShowcase };
      })
    : null;

const WizardPageLazy = lazy(async () => {
    const mod = await import('./wizard-flow');
    return { default: mod.WizardFlow };
});

const PlanDemoPageLazy = lazy(async () => {
    const mod = await import('@/features/plan');
    return { default: mod.PlanDemoPage };
});

const Plan3dDemoPageLazy = lazy(async () => {
    const mod = await import('@/features/plan3d');
    return { default: mod.Plan3dDemoPage };
});

const LoginPageLazy = lazy(async () => {
    const mod = await import('@/features/auth');
    return { default: mod.LoginPage };
});

const RegisterPageLazy = lazy(async () => {
    const mod = await import('@/features/auth');
    return { default: mod.RegisterPage };
});

const ProjectsPageLazy = lazy(async () => {
    const mod = await import('@/features/projects');
    return { default: mod.ProjectsPage };
});

const AdminPageLazy = lazy(async () => {
    const mod = await import('@/features/admin');
    return { default: mod.AdminPage };
});

export interface AppRoutesProps {
    readonly hash: string;
}

export function AppRoutes({ hash }: AppRoutesProps): React.JSX.Element {
    const isUiDev = import.meta.env.DEV && hash === '#/ui';

    if (isUiDev && DevShowcase !== null) {
        return (
            <Suspense fallback={null}>
                <DevShowcase />
            </Suspense>
        );
    }

    if (hash === '#/health' || hash.startsWith('#/health?')) {
        return <AppShell />;
    }

    if (hash === '#/login' || hash.startsWith('#/login?')) {
        return (
            <Suspense fallback={null}>
                <LoginPageLazy />
            </Suspense>
        );
    }

    if (hash === '#/register' || hash.startsWith('#/register?')) {
        return (
            <Suspense fallback={null}>
                <RegisterPageLazy />
            </Suspense>
        );
    }

    if (hash === '#/projects' || hash.startsWith('#/projects?')) {
        return (
            <Suspense fallback={null}>
                <ProjectsPageLazy />
            </Suspense>
        );
    }

    if (
        hash === '#/admin' ||
        hash.startsWith('#/admin?') ||
        hash.startsWith('#/admin/')
    ) {
        return (
            <Suspense fallback={null}>
                <AdminPageLazy hash={hash} />
            </Suspense>
        );
    }

    if (hash === '#/wizard' || hash.startsWith('#/wizard?')) {
        return (
            <Suspense fallback={null}>
                <WizardPageLazy />
            </Suspense>
        );
    }

    if (import.meta.env.DEV && hash === '#/plan-demo') {
        return (
            <Suspense fallback={null}>
                <PlanDemoPageLazy />
            </Suspense>
        );
    }

    if (
        import.meta.env.DEV &&
        (hash === '#/plan3d-demo' || hash.startsWith('#/plan3d-demo?'))
    ) {
        return (
            <Suspense fallback={null}>
                <Plan3dDemoPageLazy />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={null}>
            <WizardPageLazy />
        </Suspense>
    );
}
