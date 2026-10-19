import { useState, useRef, useEffect } from 'react';

export interface UseDropdownMenuResult {
    readonly isOpen: boolean;
    readonly toggle: () => void;
    readonly close: () => void;
    readonly menuRef: React.RefObject<HTMLDivElement>;
}

export function useDropdownMenu(): UseDropdownMenuResult {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent): void {
            if (
                menuRef.current &&
                event.target instanceof Node &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
        return undefined;
    }, [isOpen]);

    return {
        isOpen,
        toggle: () => {
            setIsOpen((isCurrent) => !isCurrent);
        },
        close: () => {
            setIsOpen(false);
        },
        menuRef,
    };
}
