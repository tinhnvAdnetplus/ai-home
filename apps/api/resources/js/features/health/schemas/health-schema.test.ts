import { describe, it, expect } from 'vitest';
import { parseHealthResponse, SchemaError } from './health-schema';

describe('features/health/schemas/health-schema', () => {
    it('parses valid payload successfully', () => {
        const raw = {
            status: 'ok',
            db: 'up',
            time: '2026-10-12T10:00:00Z',
        };
        const parsed = parseHealthResponse(raw);
        expect(parsed).toEqual(raw);
    });

    it('accepts and strips or keeps extra fields', () => {
        const raw = {
            status: 'ok',
            db: 'up',
            time: '2026-10-12T10:00:00Z',
            unexpectedField: 'accepted',
        };
        const parsed = parseHealthResponse(raw);
        expect(parsed.status).toBe('ok');
        expect(parsed.db).toBe('up');
        expect(parsed.time).toBe('2026-10-12T10:00:00Z');
    });

    it('throws SchemaError with INVALID_PAYLOAD code when status or db is missing', () => {
        const raw = {
            status: 'ok',
            time: '2026-10-12T10:00:00Z',
        };
        expect(() => parseHealthResponse(raw)).toThrow(SchemaError);
        expect(() => parseHealthResponse(raw)).toThrow('INVALID_PAYLOAD');
    });

    it('throws SchemaError when time is not a string', () => {
        const raw = {
            status: 'ok',
            db: 'up',
            time: 123456789,
        };
        expect(() => parseHealthResponse(raw)).toThrow(SchemaError);
    });

    it('throws SchemaError when input is non-object', () => {
        expect(() => parseHealthResponse('not an object')).toThrow(SchemaError);
        expect(() => parseHealthResponse(null)).toThrow(SchemaError);
    });
});
