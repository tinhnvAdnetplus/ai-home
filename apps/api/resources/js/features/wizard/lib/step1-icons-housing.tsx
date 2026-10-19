import { cn } from '@/shared/lib/cn';
import { type Step1IconProps } from './step1-icons-types';

export { Step1RentalIcon, Step1OtherIcon } from './step1-icons-housing-rental';

/** 2. 住宅の種類 -> 二世帯住宅 */
export function Step1TwoHousesIcon({
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
            <path
                d="M 14 14 L 3 24 L 6 24 L 6 42 L 22 42 L 22 24 L 25 24 Z"
                fill={color}
            />
            <rect x="10" y="28" width="6" height="14" fill="#ffffff" />
            <path
                d="M 33 7 L 19 19 L 23 19 L 23 42 L 43 42 L 43 19 L 47 19 Z"
                fill={color}
            />
            <rect x="29" y="27" width="8" height="15" fill="#ffffff" />
            <rect x="28" y="16" width="5" height="5" fill="#ffffff" />
            <rect x="35" y="16" width="5" height="5" fill="#ffffff" />
        </svg>
    );
}
