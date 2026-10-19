import { createContext, useContext } from 'react';

/**
 * How a field renders its own label:
 * - `full`: label + required/optional chip (stand-alone field)
 * - `sub`: small label without chip (several fields share one question card)
 * - `hidden`: screen-reader only (the question card title already says it)
 */
export type FieldHeaderMode = 'full' | 'sub' | 'hidden';

const FieldHeaderModeContext = createContext<FieldHeaderMode>('full');

export const FieldHeaderModeProvider = FieldHeaderModeContext.Provider;

export function useFieldHeaderMode(): FieldHeaderMode {
    return useContext(FieldHeaderModeContext);
}
