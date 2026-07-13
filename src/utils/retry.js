/**
 * Executes a function that returns a promise, retrying it if it fails.
 * Uses exponential backoff.
 * 
 * @param {Function} fn - Async function to execute
 * @param {number} retries - Number of retries (default 3)
 * @param {number} delay - Initial delay in ms (default 1000)
 */
const MAX_RETRY_DELAY_MS = 30000;

export async function runWithRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    // Cap delay and add jitter to avoid thundering herd
    const cappedDelay = Math.min(delay, MAX_RETRY_DELAY_MS);
    const jitteredDelay = Math.round(cappedDelay * (1 + Math.random() * 0.25));
    console.warn(`Operation failed, retrying in ${jitteredDelay}ms... (Retries left: ${retries})`, error);
    await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
    return runWithRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Standard fetch wrapped with retry logic for network flakiness,
 * rate limiting (429), and 5xx errors.
 */
export async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  return runWithRetry(async () => {
    const response = await fetch(url, options);

    if (response.status === 429 || response.status >= 500) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return response;
  }, retries, delay);
}
