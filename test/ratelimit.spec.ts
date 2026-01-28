import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, getRateLimitInfo, createRateLimitResponse, addRateLimitHeaders } from '../src/ratelimit';

// Mock KVNamespace
function createMockKV(initialValue: string | null = null): KVNamespace {
    let storedValue = initialValue;
    return {
        get: vi.fn().mockImplementation(() => Promise.resolve(storedValue)),
        put: vi.fn().mockImplementation((key: string, value: string) => {
            storedValue = value;
            return Promise.resolve();
        }),
        delete: vi.fn(),
        list: vi.fn(),
        getWithMetadata: vi.fn(),
    } as unknown as KVNamespace;
}

describe('Rate Limiter', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-28T12:00:00Z'));
    });

    describe('checkRateLimit', () => {
        it('should allow request when under limit', async () => {
            const kv = createMockKV('50');
            const result = await checkRateLimit(kv, 1000);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(949); // 1000 - 51
            expect(result.limit).toBe(1000);
            expect(kv.put).toHaveBeenCalled();
        });

        it('should block request when at limit', async () => {
            const kv = createMockKV('1000');
            const result = await checkRateLimit(kv, 1000);

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
            expect(kv.put).not.toHaveBeenCalled();
        });

        it('should start from 0 when no previous count', async () => {
            const kv = createMockKV(null);
            const result = await checkRateLimit(kv, 1000);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(999);
        });
    });

    describe('getRateLimitInfo', () => {
        it('should return current status without incrementing', async () => {
            const kv = createMockKV('100');
            const result = await getRateLimitInfo(kv, 1000);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(900);
            expect(kv.put).not.toHaveBeenCalled();
        });
    });

    describe('createRateLimitResponse', () => {
        it('should create 429 response with correct headers', () => {
            const result = {
                allowed: false,
                remaining: 0,
                limit: 1000,
                reset: new Date('2026-01-29T00:00:00Z'),
            };

            const response = createRateLimitResponse(result);

            expect(response.status).toBe(429);
            expect(response.headers.get('X-RateLimit-Limit')).toBe('1000');
            expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
            expect(response.headers.get('Content-Type')).toContain('application/json');
        });
    });

    describe('addRateLimitHeaders', () => {
        it('should add rate limit headers to response', () => {
            const originalResponse = new Response('test content', {
                headers: { 'Content-Type': 'text/plain' },
            });

            const result = {
                allowed: true,
                remaining: 900,
                limit: 1000,
                reset: new Date('2026-01-29T00:00:00Z'),
            };

            const newResponse = addRateLimitHeaders(originalResponse, result);

            expect(newResponse.headers.get('X-RateLimit-Limit')).toBe('1000');
            expect(newResponse.headers.get('X-RateLimit-Remaining')).toBe('900');
            expect(newResponse.headers.get('Content-Type')).toBe('text/plain');
        });
    });
});
