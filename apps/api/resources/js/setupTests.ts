import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

expect.extend(matchers);

// findBy*/waitFor default to 1 s, which false-fails lazy-loaded components when the machine is busy.
configure({ asyncUtilTimeout: 8000 });

afterEach(() => {
    cleanup();
});

Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => undefined;
Element.prototype.releasePointerCapture = () => undefined;
Element.prototype.scrollIntoView = () => undefined;
