import { type PlanViewMode } from '../components/PlanViewSwitcher';

export function getInitialViewMode(): PlanViewMode {
    if (typeof window === 'undefined') {
        return '2d';
    }
    if (window.location.hash.includes('view=3d')) {
        return '3d';
    }
    if (window.location.hash.includes('view=elevations')) {
        return 'elevations';
    }
    if (window.location.hash.includes('view=cost')) {
        return 'cost';
    }
    if (window.location.hash.includes('view=spec')) {
        return 'spec';
    }
    if (window.location.hash.includes('view=input')) {
        return 'inputSummary';
    }
    return '2d';
}
