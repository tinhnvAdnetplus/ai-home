import 'vitest';
import type { NoViolationsMatcherResult } from 'vitest-axe/matchers';

declare module 'vitest' {
    interface Assertion<T = unknown, R = unknown> {
        toHaveNoViolations(): [T, R] extends [never, never]
            ? never
            : NoViolationsMatcherResult;
    }
    interface AsymmetricMatchersContaining {
        toHaveNoViolations(): NoViolationsMatcherResult;
    }
}
