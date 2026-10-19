import { useCallback, useEffect } from 'react';

export function useFullscreenToggle(
    containerRef: React.RefObject<HTMLElement>,
    setIsFullscreen: (isOn: boolean) => void,
): () => void {
    useEffect(() => {
        const onFullscreenChange = (): void => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => {
            document.removeEventListener(
                'fullscreenchange',
                onFullscreenChange,
            );
        };
    }, [setIsFullscreen]);

    return useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const request = document.fullscreenElement
            ? document.exitFullscreen()
            : container.requestFullscreen();
        void request
            .then(() => {
                setIsFullscreen(Boolean(document.fullscreenElement));
            })
            .catch(() => {
                setIsFullscreen(false);
            });
    }, [containerRef, setIsFullscreen]);
}
