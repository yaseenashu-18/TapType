export interface SavedTestResult {
  accuracy: number;
  consistency: number;
  date: string;
  id: string;
  mode: string;
  modeDetail: string;
  raw: number;
  wpm: number;
}

const HISTORY_KEY = "tc-test-history";
const MAX_HISTORY = 50;

export function getStoredTestHistory(): SavedTestResult[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SavedTestResult[]) : [];
  } catch {
    return [];
  }
}

export function saveTestResult(stats: {
  wpm: number;
  accuracy: number;
  raw: number;
  consistency: number;
  mode: string;
  modeDetail: string;
}): SavedTestResult[] {
  if (typeof window === "undefined") {
    return [];
  }
  const history = getStoredTestHistory();
  const latest = history[0];
  const now = Date.now();

  if (
    latest &&
    latest.wpm === stats.wpm &&
    latest.accuracy === stats.accuracy &&
    latest.mode === stats.mode &&
    latest.modeDetail === String(stats.modeDetail) &&
    now - new Date(latest.date).getTime() < 10_000
  ) {
    return history;
  }

  const newEntry: SavedTestResult = {
    id: String(now),
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    raw: stats.raw,
    consistency: stats.consistency,
    mode: stats.mode,
    modeDetail: String(stats.modeDetail),
    date: new Date(now).toISOString(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    /* ignore storage errors */
  }
  return updated;
}

export function clearStoredTestHistory(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(HISTORY_KEY);
}
