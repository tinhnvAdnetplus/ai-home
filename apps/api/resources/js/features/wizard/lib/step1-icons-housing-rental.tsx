import { cn } from '@/shared/lib/cn';
import { type Step1IconProps } from './step1-icons-types';

/** 2. 住宅の種類 -> 賃貸併用住宅 */
export function Step1RentalIcon({
    className,
    isSelected = false,
}: Step1IconProps): React.JSX.Element {
    const color = isSelected ? '#0b6bdc' : '#7c93a7';
    return (
        <svg
            viewBox="0 0 48 48"
            className={cn('h-11 w-11 shrink-0', className)}
            aria-hidden="true"
        >
            <rect x="10" y="6" width="28" height="38" rx="2" fill={color} />
            <rect x="14" y="10" width="5" height="6" rx="0.5" fill="#ffffff" />
            <rect
                x="21.5"
                y="10"
                width="5"
                height="6"
                rx="0.5"
                fill="#ffffff"
            />
            <rect x="29" y="10" width="5" height="6" rx="0.5" fill="#ffffff" />
            <rect x="14" y="19" width="5" height="6" rx="0.5" fill="#ffffff" />
            <rect
                x="21.5"
                y="19"
                width="5"
                height="6"
                rx="0.5"
                fill="#ffffff"
            />
            <rect x="29" y="19" width="5" height="6" rx="0.5" fill="#ffffff" />
            <rect x="14" y="28" width="5" height="6" rx="0.5" fill="#ffffff" />
            <rect
                x="21.5"
                y="28"
                width="5"
                height="6"
                rx="0.5"
                fill="#ffffff"
            />
            <rect x="29" y="28" width="5" height="6" rx="0.5" fill="#ffffff" />
            <rect x="20" y="37" width="8" height="7" fill="#ffffff" />
        </svg>
    );
}

/** 2. 住宅の種類 -> その他 */
export function Step1OtherIcon({
    className,
    isSelected = false,
}: Step1IconProps): React.JSX.Element {
    const color = isSelected ? '#0b6bdc' : '#7c93a7';
    return (
        <svg
            viewBox="0 0 48 48"
            className={cn('h-11 w-11 shrink-0', className)}
            aria-hidden="true"
        >
            <circle cx="12" cy="24" r="3.5" fill={color} />
            <circle cx="24" cy="24" r="3.5" fill={color} />
            <circle cx="36" cy="24" r="3.5" fill={color} />
        </svg>
    );
}
