export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    limit: number;
    reset: Date;
}

// Default daily limit
const DEFAULT_DAILY_LIMIT = 1000;

/**
 * Get the current date key in YYYY-MM-DD format (UTC)
 */
function getDateKey(): string {
    const now = new Date();
    return `rate:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Get the reset time (start of next UTC day)
 */
function getResetTime(): Date {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return tomorrow;
}

/**
 * Check rate limit and increment counter if allowed.
 * Returns rate limit status.
 */
export async function checkRateLimit(
    kv: KVNamespace,
    limit: number = DEFAULT_DAILY_LIMIT
): Promise<RateLimitResult> {
    const key = getDateKey();
    const reset = getResetTime();

    // Get current count
    const currentValue = await kv.get(key);
    const currentCount = currentValue ? parseInt(currentValue, 10) : 0;

    if (currentCount >= limit) {
        return {
            allowed: false,
            remaining: 0,
            limit,
            reset,
        };
    }

    // Increment counter with expiration (2 days to handle timezone edge cases)
    const newCount = currentCount + 1;
    await kv.put(key, String(newCount), {
        expirationTtl: 60 * 60 * 24 * 2, // 2 days in seconds
    });

    return {
        allowed: true,
        remaining: limit - newCount,
        limit,
        reset,
    };
}

/**
 * Get current rate limit info without incrementing.
 */
export async function getRateLimitInfo(
    kv: KVNamespace,
    limit: number = DEFAULT_DAILY_LIMIT
): Promise<RateLimitResult> {
    const key = getDateKey();
    const reset = getResetTime();

    const currentValue = await kv.get(key);
    const currentCount = currentValue ? parseInt(currentValue, 10) : 0;

    return {
        allowed: currentCount < limit,
        remaining: Math.max(0, limit - currentCount),
        limit,
        reset,
    };
}

/**
 * Create rate limit exceeded response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
    return new Response(
        JSON.stringify({
            error: 'Rate limit exceeded',
            message: '今日请求次数已达上限，请明天再试',
            remaining: result.remaining,
            limit: result.limit,
            reset: result.reset.toISOString(),
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': String(result.remaining),
                'X-RateLimit-Reset': result.reset.toISOString(),
                'Retry-After': String(Math.ceil((result.reset.getTime() - Date.now()) / 1000)),
                'Access-Control-Allow-Origin': '*',
            },
        }
    );
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-RateLimit-Limit', String(result.limit));
    newHeaders.set('X-RateLimit-Remaining', String(result.remaining));
    newHeaders.set('X-RateLimit-Reset', result.reset.toISOString());

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}
