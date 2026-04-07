import { buildW3CTraceparentHeaders } from "@/lib/w3cTraceContext";

const SYNTHETIC_HEADER = { "X-Synthetic-Traffic": "1" } as const;

export type TrafficSimulatorCallbacks = {
  onStart?: () => void;
  onStop?: () => void;
  onTick?: (remainingMs: number) => void;
};

let active = false;
const trackedTimeouts: ReturnType<typeof setTimeout>[] = [];
let stopDeadlineTimer: ReturnType<typeof setTimeout> | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let lastCallbacks: TrafficSimulatorCallbacks | undefined;

function trackTimeout(id: ReturnType<typeof setTimeout>) {
  trackedTimeouts.push(id);
}

function clearTrackedTimeouts() {
  trackedTimeouts.forEach((id) => clearTimeout(id));
  trackedTimeouts.length = 0;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickTraceSimulation(): "success" | "slow" | "fail" {
  const r = Math.random();
  if (r < 0.1) return "fail";
  if (r < 0.38) return "slow";
  return "success";
}

function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:3001"
      : `${window.location.protocol}//${window.location.hostname}:3001`)
  );
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function runSyntheticCheckout(apiBaseUrl: string) {
  const totalPrice = Math.round(randomBetween(49, 14999) * 100) / 100;
  const simulateFailure = Math.random() < 0.1;
  try {
    await fetch(`${apiBaseUrl}/log-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildW3CTraceparentHeaders(),
        ...SYNTHETIC_HEADER,
      },
      body: JSON.stringify({ totalPrice, simulateFailure }),
    });
  } catch {
    /* synthetic — ignore network errors */
  }
}

async function runSyntheticTrace(apiBaseUrl: string, token: string | null) {
  if (!token) return;
  const simulation = pickTraceSimulation();
  try {
    await fetch(`${apiBaseUrl}/api/traces/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...buildW3CTraceparentHeaders(),
        ...SYNTHETIC_HEADER,
      },
      body: JSON.stringify({ simulation }),
    });
  } catch {
    /* synthetic — ignore */
  }
}

function scheduleCheckoutLoop(apiBaseUrl: string) {
  if (!active) return;
  const delayMs = randomBetween(7000, 22000);
  const id = setTimeout(() => {
    if (!active) return;
    void runSyntheticCheckout(apiBaseUrl);
    scheduleCheckoutLoop(apiBaseUrl);
  }, delayMs);
  trackTimeout(id);
}

function scheduleTraceLoop(apiBaseUrl: string) {
  if (!active) return;
  const delayMs = randomBetween(12000, 35000);
  const id = setTimeout(() => {
    if (!active) return;
    void runSyntheticTrace(apiBaseUrl, getAuthToken());
    scheduleTraceLoop(apiBaseUrl);
  }, delayMs);
  trackTimeout(id);
}

/**
 * Starts synthetic checkout + trace traffic for `durationMs`.
 * Checkouts do not require auth; traces require a stored auth token.
 */
export function startSyntheticTraffic(
  durationMs: number,
  callbacks?: TrafficSimulatorCallbacks,
) {
  stopSyntheticTraffic();
  lastCallbacks = callbacks;
  active = true;
  const apiBaseUrl = getApiBaseUrl();
  const endAt = Date.now() + durationMs;

  callbacks?.onStart?.();

  tickInterval = setInterval(() => {
    if (!active) return;
    callbacks?.onTick?.(Math.max(0, endAt - Date.now()));
  }, 1000);

  void runSyntheticCheckout(apiBaseUrl);
  void runSyntheticTrace(apiBaseUrl, getAuthToken());

  scheduleCheckoutLoop(apiBaseUrl);
  scheduleTraceLoop(apiBaseUrl);

  stopDeadlineTimer = setTimeout(() => {
    stopSyntheticTraffic();
  }, durationMs);
}

export function stopSyntheticTraffic(callbacks?: TrafficSimulatorCallbacks) {
  if (!active && !stopDeadlineTimer && !tickInterval) return;
  const cb = callbacks ?? lastCallbacks;
  active = false;
  lastCallbacks = undefined;
  if (stopDeadlineTimer) {
    clearTimeout(stopDeadlineTimer);
    stopDeadlineTimer = null;
  }
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
  clearTrackedTimeouts();
  cb?.onStop?.();
}

export function isSyntheticTrafficActive() {
  return active;
}
