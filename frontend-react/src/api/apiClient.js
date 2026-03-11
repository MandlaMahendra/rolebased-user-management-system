/**
 * Centralized API Client
 * 
 * All API calls go through this module. It handles:
 * - Base URL resolution (uses Vite proxy in dev, env var in production)
 * - Automatic timeout (prevents hanging requests)
 * - Retry logic for transient network failures
 * - Detailed error messages instead of generic "Network error"
 * - Auth header injection
 */

// In development, the Vite proxy forwards /api/* to the backend,
// so we use a relative URL. In production, use the env variable.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep helper for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core fetch wrapper with timeout, retry, and detailed error messages.
 *
 * @param {string} endpoint - API endpoint path (e.g. '/auth/login')
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @param {object} config - extra config { retries, timeout }
 * @returns {Promise<Response>} the fetch Response object
 */
async function request(endpoint, options = {}, config = {}) {
    const { retries = MAX_RETRIES, timeout = DEFAULT_TIMEOUT_MS } = config;
    const url = `${BASE_URL}${endpoint}`;

    // Merge default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Attach auth token if present
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = { ...options, headers };

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (err) {
            clearTimeout(timeoutId);
            lastError = err;

            // Don't retry if the user intentionally aborted
            if (err.name === 'AbortError') {
                throw new ApiError(
                    'Request timed out. The server may be starting up — please wait a moment and try again.',
                    'TIMEOUT'
                );
            }

            // On network failure, retry after a delay (except on last attempt)
            if (attempt < retries) {
                console.warn(
                    `[apiClient] Attempt ${attempt + 1} failed for ${endpoint}. Retrying in ${RETRY_DELAY_MS}ms...`,
                    err.message
                );
                await sleep(RETRY_DELAY_MS);
            }
        }
    }

    // All retries exhausted — provide a helpful, specific error message
    throw new ApiError(
        getNetworkErrorMessage(lastError),
        'NETWORK'
    );
}

/**
 * Custom error class so callers can distinguish API errors from other errors.
 */
export class ApiError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
    }
}

/**
 * Turn a raw network error into a user-friendly message.
 */
function getNetworkErrorMessage(err) {
    if (!navigator.onLine) {
        return 'You are offline. Please check your internet connection and try again.';
    }

    const msg = err?.message?.toLowerCase() || '';

    if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
        return 'Cannot connect to the server. Please make sure the backend server is running (npm run dev in the backend folder) and try again.';
    }

    if (msg.includes('cors')) {
        return 'A cross-origin (CORS) error occurred. Please make sure the backend server is running.';
    }

    return `Connection failed: ${err?.message || 'Unknown error'}. Please make sure the backend server is running.`;
}

// ──────────────────────────────────────────────
// Safe JSON parser
// ──────────────────────────────────────────────

/**
 * Safely parse JSON from a response. If the response is not JSON
 * (e.g. the Vite proxy returned an HTML error page because the
 * backend is down), throw a clear ApiError instead of a SyntaxError.
 */
async function safeJson(res) {
    const contentType = res.headers.get('content-type') || '';

    // If the server returned a 502/503/504 (proxy error), the backend is down
    if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new ApiError(
            'Cannot connect to the backend server. Please make sure the backend is running (npm run dev in the backend folder).',
            'SERVER_DOWN'
        );
    }

    // If the response isn't JSON, something is very wrong
    if (!contentType.includes('application/json')) {
        throw new ApiError(
            'The server returned an unexpected response. Please make sure the backend is running (npm run dev in the backend folder).',
            'INVALID_RESPONSE'
        );
    }

    try {
        return await res.json();
    } catch {
        throw new ApiError(
            'Failed to parse server response. The backend may have crashed — please restart it.',
            'PARSE_ERROR'
        );
    }
}

// ──────────────────────────────────────────────
// Convenience methods
// ──────────────────────────────────────────────

/**
 * POST JSON to an endpoint and return parsed JSON + response metadata.
 */
export async function post(endpoint, body) {
    const res = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    const data = await safeJson(res);
    return { ok: res.ok, status: res.status, data };
}

/**
 * GET from an endpoint and return parsed JSON + response metadata.
 */
export async function get(endpoint) {
    const res = await request(endpoint, { method: 'GET' });
    const data = await safeJson(res);
    return { ok: res.ok, status: res.status, data };
}

/**
 * PUT JSON to an endpoint and return parsed JSON + response metadata.
 */
export async function put(endpoint, body) {
    const res = await request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
    const data = await safeJson(res);
    return { ok: res.ok, status: res.status, data };
}

/**
 * DELETE an endpoint and return parsed JSON + response metadata.
 */
export async function del(endpoint) {
    const res = await request(endpoint, { method: 'DELETE' });
    const data = await safeJson(res);
    return { ok: res.ok, status: res.status, data };
}

export default { post, get, put, del, ApiError };
