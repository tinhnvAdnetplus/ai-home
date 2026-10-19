import { describe, expect, it } from 'vitest';
import {
    BINDING_REGISTRY,
    findBindingEntry,
    type PlannerValueType,
} from './binding-registry.js';
import { bindingKeySchema } from './primitives.js';

describe('BINDING_REGISTRY', () => {
    it('contains no duplicate keys', () => {
        const seen = new Set<string>();
        for (const entry of BINDING_REGISTRY) {
            expect(seen.has(entry.key)).toBe(false);
            seen.add(entry.key);
        }
    });

    it('every key matches bindingKeySchema', () => {
        for (const entry of BINDING_REGISTRY) {
            const res = bindingKeySchema.safeParse(entry.key);
            expect(res.success).toBe(true);
        }
    });

    it('every valueType is one of the four allowed planner types', () => {
        const allowedTypes: PlannerValueType[] = [
            'number',
            'string',
            'boolean',
            'string[]',
        ];
        for (const entry of BINDING_REGISTRY) {
            expect(allowedTypes.includes(entry.valueType)).toBe(true);
        }
    });

    it('every entry has a non-empty description', () => {
        for (const entry of BINDING_REGISTRY) {
            expect(entry.description.trim().length).toBeGreaterThan(0);
        }
    });

    it('findBindingEntry resolves entries correctly', () => {
        const siteFrontage = findBindingEntry('site.frontage');
        expect(siteFrontage).toBeDefined();
        expect(siteFrontage?.valueType).toBe('number');

        expect(findBindingEntry('nonexistent.binding')).toBeUndefined();
    });
});
