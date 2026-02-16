import type { Target } from "../data/targets";

export type CheckStatus = "pending" | "checking" | "clean" | "blocked" | "error";

export interface CheckResult {
  target: Target;
  status: CheckStatus;
  attempts: number;
  timing: number;
  transferSize: number | null;
  detail: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 15000;
const DPI_LOW_BYTES = 16000;
const DPI_HIGH_BYTES = 21000;
const DPI_MIN_TIMING_MS = 300;
const DPI_MAX_TIMING_MS = 10000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addCacheBuster(url: string, attempt: number): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_cb=${Date.now()}-${attempt}`;
}

function getResourceTiming(url: string): PerformanceResourceTiming | null {
  if (typeof performance === "undefined" || !performance.getEntriesByName) return null;
  const entries = performance.getEntriesByName(url, "resource");
  if (entries.length === 0) return null;
  return entries[entries.length - 1] as PerformanceResourceTiming;
}

interface AttemptResult {
  success: boolean;
  timing: number;
  transferSize: number | null;
  isDpiSignature: boolean;
  detail: string;
}

async function singleAttempt(target: Target, attemptNum: number): Promise<AttemptResult> {
  const bustUrl = addCacheBuster(target.url, attemptNum);
  const startTime = performance.now();
  let timing = 0;
  let transferSize: number | null = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(bustUrl, {
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);
    timing = performance.now() - startTime;

    await sleep(50);
    const perfEntry = getResourceTiming(bustUrl);
    if (perfEntry) {
      transferSize = perfEntry.transferSize || perfEntry.encodedBodySize || null;
    }

    const typeLabel = response.type === "opaque" ? "opaque response" : `status ${response.status}`;
    return {
      success: true,
      timing,
      transferSize,
      isDpiSignature: false,
      detail: `${typeLabel} in ${timing.toFixed(0)}ms`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    timing = performance.now() - startTime;

    await sleep(50);
    const perfEntry = getResourceTiming(bustUrl);
    if (perfEntry) {
      transferSize = perfEntry.transferSize || perfEntry.encodedBodySize || null;
    }

    const error = err as Error;

    if (error.name === "AbortError") {
      return {
        success: false,
        timing,
        transferSize,
        isDpiSignature: false,
        detail: `timeout after ${REQUEST_TIMEOUT_MS}ms`,
      };
    }

    const isDpiTiming = timing >= DPI_MIN_TIMING_MS && timing <= DPI_MAX_TIMING_MS;
    const isDpiTransfer =
      transferSize !== null &&
      transferSize >= DPI_LOW_BYTES &&
      transferSize <= DPI_HIGH_BYTES;
    const isDpiSignature = isDpiTiming || isDpiTransfer;

    const sizeInfo = transferSize ? ` / ${transferSize} bytes` : "";
    return {
      success: false,
      timing,
      transferSize,
      isDpiSignature,
      detail: isDpiSignature
        ? `connection reset at ${timing.toFixed(0)}ms${sizeInfo} — DPI signature`
        : `network error: ${error.message} at ${timing.toFixed(0)}ms`,
    };
  }
}

export async function checkTarget(
  target: Target,
  onProgress?: (result: CheckResult) => void
): Promise<CheckResult> {
  const result: CheckResult = {
    target,
    status: "checking",
    attempts: 0,
    timing: 0,
    transferSize: null,
    detail: "",
  };

  onProgress?.({ ...result });

  let dpiSignatureCount = 0;
  let lastDetail = "";
  let lastTiming = 0;
  let lastTransferSize: number | null = null;
  let networkErrorCount = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    result.attempts = attempt;

    if (attempt > 1) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 2);
      await sleep(delay);
    }

    const attemptResult = await singleAttempt(target, attempt);

    lastDetail = attemptResult.detail;
    lastTiming = attemptResult.timing;
    lastTransferSize = attemptResult.transferSize;

    if (attemptResult.success) {
      return {
        ...result,
        status: "clean",
        timing: attemptResult.timing,
        transferSize: attemptResult.transferSize,
        detail: `${attemptResult.detail} (attempt ${attempt}/${MAX_RETRIES})`,
      };
    }

    networkErrorCount++;
    if (attemptResult.isDpiSignature) {
      dpiSignatureCount++;
    }

    onProgress?.({
      ...result,
      status: "checking",
      timing: attemptResult.timing,
      transferSize: attemptResult.transferSize,
      detail: `attempt ${attempt}/${MAX_RETRIES}: ${attemptResult.detail}`,
    });
  }

  if (dpiSignatureCount >= 2) {
    return {
      ...result,
      status: "blocked",
      timing: lastTiming,
      transferSize: lastTransferSize,
      detail: `DPI block detected (${dpiSignatureCount}/${MAX_RETRIES} DPI signatures). ${lastDetail}`,
    };
  }

  if (networkErrorCount === MAX_RETRIES) {
    return {
      ...result,
      status: "blocked",
      timing: lastTiming,
      transferSize: lastTransferSize,
      detail: `endpoint blocked — all ${MAX_RETRIES} attempts failed. ${lastDetail}`,
    };
  }

  return {
    ...result,
    status: "error",
    timing: lastTiming,
    transferSize: lastTransferSize,
    detail: `inconclusive after ${MAX_RETRIES} attempts. ${lastDetail}`,
  };
}

export async function runAllChecks(
  targets: Target[],
  concurrency: number,
  onResult: (index: number, result: CheckResult) => void,
  onOverallProgress: (completed: number, total: number) => void,
  abortSignal?: AbortSignal
): Promise<CheckResult[]> {
  const results: CheckResult[] = new Array(targets.length);
  let completed = 0;
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < targets.length) {
      if (abortSignal?.aborted) return;
      const idx = nextIndex++;
      const target = targets[idx];

      const result = await checkTarget(target, (partial) => {
        onResult(idx, partial);
      });

      results[idx] = result;
      onResult(idx, result);
      completed++;
      onOverallProgress(completed, targets.length);
    }
  }

  const workers: Promise<void>[] = [];
  const workerCount = Math.min(concurrency, targets.length);
  for (let i = 0; i < workerCount; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}
