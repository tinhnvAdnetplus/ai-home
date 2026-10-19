import { type ReactNode } from 'react';
import { MapPin, PlusSquare, Route } from 'lucide-react';

/**
 * Returns an icon prefix element for inputs that feature an icon in the design (e.g. Step 2 land fields).
 */
export function getFieldPrefixIcon(fieldKey: string): ReactNode | null {
    if (fieldKey === 'land_location') {
        return (
            <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-primary border border-sky-100"
                aria-hidden="true"
            >
                <MapPin className="h-5 w-5" />
            </span>
        );
    }
    if (fieldKey === 'land_area') {
        return (
            <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-primary border border-sky-100"
                aria-hidden="true"
            >
                <PlusSquare className="h-5 w-5" />
            </span>
        );
    }
    if (fieldKey === 'road_width') {
        return (
            <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-primary border border-sky-100"
                aria-hidden="true"
            >
                <Route className="h-5 w-5" />
            </span>
        );
    }
    return null;
}
