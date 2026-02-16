import { useState, useCallback, useRef, useMemo } from "react";
import { ALL_TARGETS, PROVIDER_COLORS, PROVIDER_ICONS, PROVIDER_NAMES } from "./data/targets";
import type { Target, ProviderName } from "./data/targets";
import { runAllChecks, checkTarget, type CheckResult, type CheckStatus } from "./engine/dpiChecker";
import { t, type Lang } from "./i18n/translations";

type Theme = "dark" | "light";
type FilterType = "all" | ProviderName | "blocked" | "clean";

const STATUS_ICONS: Record<CheckStatus, string> = {
  pending: "○",
  checking: "",
  clean: "●",
  blocked: "●",
  error: "●",
};

function IconButton({
  onClick,
  title,
  icon,
  dark,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  dark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-base transition-colors ${
        dark
          ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
    </button>
  );
}

function StatusBadge({ status, lang, theme }: { status: CheckStatus; lang: Lang; theme: Theme }) {
  const dark = theme === "dark";
  const cfg: Record<CheckStatus, { bg: string; text: string; labelKey: "pending" | "checking" | "clean" | "blocked" | "error" }> = {
    pending:  { bg: dark ? "bg-gray-700"       : "bg-gray-100",     text: dark ? "text-gray-400"    : "text-gray-500",    labelKey: "pending"  },
    checking: { bg: dark ? "bg-blue-900/50"    : "bg-blue-100",     text: dark ? "text-blue-300"    : "text-blue-700",    labelKey: "checking" },
    clean:    { bg: dark ? "bg-emerald-900/50" : "bg-emerald-100",  text: dark ? "text-emerald-300" : "text-emerald-700", labelKey: "clean"    },
    blocked:  { bg: dark ? "bg-red-900/50"     : "bg-red-100",      text: dark ? "text-red-300"     : "text-red-700",     labelKey: "blocked"  },
    error:    { bg: dark ? "bg-amber-900/50"   : "bg-amber-100",    text: dark ? "text-amber-300"   : "text-amber-700",   labelKey: "error"    },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
      {status === "checking" ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
      ) : (
        <span>{STATUS_ICONS[status]}</span>
      )}
      {t(c.labelKey, lang)}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const color = PROVIDER_COLORS[provider] || "#666";
  const icon = PROVIDER_ICONS[provider] || "🔧";
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold text-white whitespace-nowrap"
      style={{ backgroundColor: color }}
    >
      {icon} {provider}
    </span>
  );
}

function ProviderSelector({
  selected,
  onChange,
  providerCounts,
  lang,
  theme,
  disabled,
}: {
  selected: Set<ProviderName>;
  onChange: (s: Set<ProviderName>) => void;
  providerCounts: Record<string, number>;
  lang: Lang;
  theme: Theme;
  disabled: boolean;
}) {
  const dark = theme === "dark";
  const [expanded, setExpanded] = useState(true);
  const allSelected = PROVIDER_NAMES.every((p) => selected.has(p));
  const noneSelected = selected.size === 0;

  const toggleProvider = (p: ProviderName) => {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange(next);
  };

  const totalEndpoints = PROVIDER_NAMES
    .filter((p) => selected.has(p))
    .reduce((sum, p) => sum + (providerCounts[p] || 0), 0);

  return (
    <div className={`mb-6 rounded-xl border transition-colors ${dark ? "border-slate-700/50 bg-slate-800/50" : "border-slate-200 bg-white shadow-sm"}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className={`flex w-full items-center justify-between px-4 py-3 sm:px-5 sm:py-4 ${expanded ? "" : "rounded-xl"}`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-base font-bold sm:text-lg ${dark ? "text-slate-100" : "text-slate-800"}`}>
            {t("providerSelector", lang)}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
            {selected.size}/{PROVIDER_NAMES.length} {t("selectedCount", lang)} · {totalEndpoints} {t("selectedEndpoints", lang)}
          </span>
        </div>
        <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className={`border-t px-4 py-3 sm:px-5 sm:py-4 ${dark ? "border-slate-700/50" : "border-slate-200"}`}>
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => onChange(new Set(PROVIDER_NAMES))}
              disabled={disabled || allSelected}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                dark ? "bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
            >
              ✓ {t("selectAll", lang)}
            </button>
            <button
              onClick={() => onChange(new Set())}
              disabled={disabled || noneSelected}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                dark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ✕ {t("deselectAll", lang)}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {PROVIDER_NAMES.map((p) => {
              const isSelected = selected.has(p);
              const color = PROVIDER_COLORS[p] || "#666";
              const icon = PROVIDER_ICONS[p] || "🔧";
              const count = providerCounts[p] || 0;
              return (
                <label
                  key={p}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors select-none ${
                    disabled ? "cursor-not-allowed opacity-50" : ""
                  } ${
                    isSelected
                      ? dark ? "border-slate-500 bg-slate-700/80" : "border-slate-400 bg-slate-50"
                      : dark ? "border-slate-700 bg-slate-800/30 hover:border-slate-600" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProvider(p)}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] transition-colors ${
                      isSelected
                        ? "border-transparent text-white"
                        : dark ? "border-slate-500 bg-slate-700" : "border-slate-300 bg-white"
                    }`}
                    style={isSelected ? { backgroundColor: color } : {}}
                  >
                    {isSelected && "✓"}
                  </span>
                  <span className="text-sm">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-xs font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}>{p}</div>
                    <div className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"}`}>
                      {count} {t("regionsShort", lang)}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTabs({
  active,
  onChange,
  counts,
  lang,
  theme,
}: {
  active: FilterType;
  onChange: (f: FilterType) => void;
  counts: Record<string, number>;
  lang: Lang;
  theme: Theme;
}) {
  const dark = theme === "dark";
  const tabs: { key: FilterType; label: string }[] = [
    { key: "all", label: t("filterAll", lang) },
    ...PROVIDER_NAMES.map((p) => ({ key: p as FilterType, label: p })),
    { key: "blocked", label: t("filterBlocked", lang) },
    { key: "clean", label: t("filterClean", lang) },
  ];

  return (
    <div className="flex flex-wrap gap-1.5" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            active === tab.key
              ? dark ? "bg-slate-200 text-slate-900" : "bg-slate-800 text-white"
              : dark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-xs opacity-70">({counts[tab.key] || 0})</span>
        </button>
      ))}
    </div>
  );
}

function isValidHttpsUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function CustomCheckForm({
  lang,
  theme,
  onAddTarget,
  customTargets,
  onRemoveTarget,
  onClearAll,
  customResults,
  onCheckSingle,
  isCheckingSingle,
}: {
  lang: Lang;
  theme: Theme;
  onAddTarget: (target: Target) => void;
  customTargets: Target[];
  onRemoveTarget: (index: number) => void;
  onClearAll: () => void;
  customResults: Map<number, CheckResult>;
  onCheckSingle: (index: number) => void;
  isCheckingSingle: number | null;
}) {
  const dark = theme === "dark";
  const [url, setUrl] = useState("https://");
  const [provider, setProvider] = useState("Custom");
  const [region, setRegion] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const validate = (): boolean => {
    if (!isValidHttpsUrl(url)) {
      setError(t("customInvalidUrl", lang));
      return false;
    }
    setError("");
    return true;
  };

  const makeTarget = (): Target => ({
    provider: (provider || "Custom") as ProviderName,
    region: region || "custom",
    label: label || url,
    url,
  });

  const resetForm = () => {
    setUrl("https://");
    setRegion("");
    setLabel("");
  };

  const handleAdd = () => {
    if (!validate()) return;
    onAddTarget(makeTarget());
    resetForm();
  };

  const handleAddAndCheck = () => {
    if (!validate()) return;
    const idx = customTargets.length;
    onAddTarget(makeTarget());
    resetForm();
    setTimeout(() => onCheckSingle(idx), 50);
  };

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 ${
    dark
      ? "border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
      : "border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30"
  }`;

  return (
    <div className={`mb-6 rounded-xl border p-4 sm:p-5 ${dark ? "border-slate-700/50 bg-slate-800/50" : "border-slate-200 bg-white shadow-sm"}`}>
      <h3 className={`mb-1 text-base font-bold sm:text-lg ${dark ? "text-slate-100" : "text-slate-800"}`}>
        {t("customCheckTitle", lang)}
      </h3>
      <p className={`mb-4 text-xs sm:text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
        {t("customCheckDesc", lang)}
      </p>

      <div className="space-y-3">
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("customUrl", lang)}
            className={inputCls}
          />
          {error && <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className={inputCls}>
            <option value="Custom">Custom</option>
            {PROVIDER_NAMES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder={t("customRegion", lang)} className={inputCls} />
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("customLabel", lang)} className={inputCls} />

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dark ? "bg-slate-600 text-slate-200 hover:bg-slate-500" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {t("customAdd", lang)}
            </button>
            <button
              onClick={handleAddAndCheck}
              className="whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-95"
            >
              {t("customAddAndCheck", lang)}
            </button>
          </div>
        </div>
      </div>

      {customTargets.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>
              {t("customTargets", lang)} ({customTargets.length} {t("customAdded", lang)})
            </span>
            <button onClick={onClearAll} className="rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10">
              {t("customClearAll", lang)}
            </button>
          </div>
          <div className="space-y-1">
            {customTargets.map((ct, idx) => {
              const r = customResults.get(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${dark ? "bg-slate-700/50" : "bg-slate-50"}`}
                >
                  <ProviderBadge provider={ct.provider} />
                  <span className={`hidden font-mono text-xs sm:inline ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {ct.region}
                  </span>
                  <span className={`min-w-0 flex-1 truncate ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    {ct.label}
                  </span>
                  {r && <StatusBadge status={r.status} lang={lang} theme={theme} />}
                  <button
                    onClick={() => onCheckSingle(idx)}
                    disabled={isCheckingSingle === idx}
                    className={`shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      isCheckingSingle === idx ? "opacity-50" : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                    }`}
                  >
                    {isCheckingSingle === idx ? "…" : t("customCheck", lang)}
                  </button>
                  <button
                    onClick={() => onRemoveTarget(idx)}
                    className="shrink-0 rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TargetRow({
  num,
  target,
  status,
  result,
  isExpanded,
  onClick,
  lang,
  theme,
}: {
  num: number;
  target: Target;
  status: CheckStatus;
  result: CheckResult | undefined;
  isExpanded: boolean;
  onClick: () => void;
  lang: Lang;
  theme: Theme;
}) {
  const dark = theme === "dark";
  return (
    <>
      <tr
        onClick={onClick}
        className={`cursor-pointer transition-colors ${
          dark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
        } ${status === "blocked" ? (dark ? "bg-red-950/20" : "bg-red-50") : ""} ${
          status === "checking" ? (dark ? "bg-blue-950/20" : "bg-blue-50") : ""
        }`}
      >
        <td className={`px-4 py-2.5 font-mono text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{num}</td>
        <td className="px-4 py-2.5"><ProviderBadge provider={target.provider} /></td>
        <td className={`px-4 py-2.5 font-mono text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{target.region}</td>
        <td className={`hidden px-4 py-2.5 sm:table-cell ${dark ? "text-slate-400" : "text-slate-500"}`}>{target.label}</td>
        <td className="px-4 py-2.5"><StatusBadge status={status} lang={lang} theme={theme} /></td>
        <td className={`hidden px-4 py-2.5 font-mono text-xs md:table-cell ${dark ? "text-slate-500" : "text-slate-400"}`}>
          {result?.attempts ? `${result.attempts}/3` : "—"}
        </td>
        <td className={`hidden px-4 py-2.5 font-mono text-xs md:table-cell ${dark ? "text-slate-500" : "text-slate-400"}`}>
          {result?.timing ? `${Math.round(result.timing)}ms` : "—"}
        </td>
      </tr>
      {isExpanded && result && (
        <tr className={dark ? "bg-slate-800/50" : "bg-slate-50"}>
          <td colSpan={7} className="px-4 py-3">
            <div className={`rounded-lg border p-3 text-xs ${dark ? "border-slate-700/50 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <span className={dark ? "text-slate-500" : "text-slate-400"}>{t("endpoint", lang)} </span>
                  <code className={`break-all ${dark ? "text-slate-300" : "text-slate-700"}`}>{target.url}</code>
                </div>
                <div>
                  <span className={dark ? "text-slate-500" : "text-slate-400"}>{t("transferSize", lang)} </span>
                  <span className={dark ? "text-slate-300" : "text-slate-700"}>
                    {result.transferSize !== null ? `${result.transferSize} ${t("bytes", lang)}` : t("transferSizeNA", lang)}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className={dark ? "text-slate-500" : "text-slate-400"}>{t("detail", lang)} </span>
                  <span className={dark ? "text-slate-300" : "text-slate-700"}>{result.detail}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function App() {
  const [lang, setLang] = useState<Lang>("ru");
  const [theme, setTheme] = useState<Theme>("dark");
  const dark = theme === "dark";

  const [results, setResults] = useState<Map<number, CheckResult>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [concurrency, setConcurrency] = useState(6);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const [selectedProviders, setSelectedProviders] = useState<Set<ProviderName>>(
    () => new Set(PROVIDER_NAMES)
  );

  const [customTargets, setCustomTargets] = useState<Target[]>([]);
  const [customResults, setCustomResults] = useState<Map<number, CheckResult>>(new Map());
  const [isCheckingSingle, setIsCheckingSingle] = useState<number | null>(null);

  const allTargets = useMemo(
    () => [
      ...ALL_TARGETS.filter((tgt) => selectedProviders.has(tgt.provider)),
      ...customTargets,
    ],
    [customTargets, selectedProviders]
  );

  const providerCounts = useMemo(() => {
    const c: Record<string, number> = {};
    PROVIDER_NAMES.forEach((p) => { c[p] = 0; });
    ALL_TARGETS.forEach((tgt) => { c[tgt.provider] = (c[tgt.provider] || 0) + 1; });
    return c;
  }, []);

  const builtinCount = useMemo(
    () => ALL_TARGETS.filter((tgt) => selectedProviders.has(tgt.provider)).length,
    [selectedProviders]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allTargets.length, blocked: 0, clean: 0 };
    PROVIDER_NAMES.forEach((p) => { c[p] = 0; });
    c["Custom"] = 0;
    allTargets.forEach((tgt, i) => {
      c[tgt.provider] = (c[tgt.provider] || 0) + 1;
      const r = results.get(i);
      if (r?.status === "blocked") c.blocked++;
      if (r?.status === "clean") c.clean++;
    });
    return c;
  }, [results, allTargets]);

  const filteredTargets = useMemo(() => {
    return allTargets
      .map((tgt, i) => ({ target: tgt, index: i }))
      .filter(({ target, index }) => {
        if (filter === "all") return true;
        if (PROVIDER_NAMES.includes(filter as ProviderName) || filter === "Custom") {
          return target.provider === filter;
        }
        const r = results.get(index);
        if (filter === "blocked") return r?.status === "blocked";
        if (filter === "clean") return r?.status === "clean";
        return true;
      });
  }, [filter, results, allTargets]);

  const startChecks = useCallback(async () => {
    setIsRunning(true);
    setResults(new Map());
    setProgress({ completed: 0, total: allTargets.length });
    setExpandedRow(null);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      await runAllChecks(
        allTargets,
        concurrency,
        (index, result) => {
          setResults((prev) => {
            const next = new Map(prev);
            next.set(index, result);
            return next;
          });
        },
        (completed, total) => {
          setProgress({ completed, total });
        },
        ac.signal
      );
    } catch {
      // aborted
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [concurrency, allTargets]);

  const stopChecks = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const stats = useMemo(() => {
    let clean = 0, blocked = 0, error = 0, checking = 0, pending = 0;
    allTargets.forEach((_, i) => {
      const r = results.get(i);
      if (!r || r.status === "pending") pending++;
      else if (r.status === "checking") checking++;
      else if (r.status === "clean") clean++;
      else if (r.status === "blocked") blocked++;
      else if (r.status === "error") error++;
    });
    return { clean, blocked, error, checking, pending };
  }, [results, allTargets]);

  const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  const exportResults = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    const data = allTargets.map((tgt, i) => {
      const r = results.get(i);
      return {
        provider: tgt.provider,
        region: tgt.region,
        label: tgt.label,
        url: tgt.url,
        status: r?.status || "pending",
        attempts: r?.attempts || 0,
        timing: r?.timing ? Math.round(r.timing) : null,
        transferSize: r?.transferSize || null,
        detail: r?.detail || "",
      };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlRef.current = blobUrl;

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `dpi-check-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    a.click();
  }, [results, allTargets]);

  const addCustomTarget = useCallback((target: Target) => {
    setCustomTargets((prev) => [...prev, target]);
  }, []);

  const removeCustomTarget = useCallback((index: number) => {
    setCustomTargets((prev) => prev.filter((_, i) => i !== index));
    setCustomResults((prev) => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const clearCustomTargets = useCallback(() => {
    setCustomTargets([]);
    setCustomResults(new Map());
  }, []);

  const checkSingleCustom = useCallback(
    async (index: number) => {
      const target = customTargets[index];
      if (!target) return;
      setIsCheckingSingle(index);
      try {
        const result = await checkTarget(target, (partial) => {
          setCustomResults((prev) => new Map(prev).set(index, partial));
          setResults((prev) => new Map(prev).set(builtinCount + index, partial));
        });
        setCustomResults((prev) => new Map(prev).set(index, result));
        setResults((prev) => new Map(prev).set(builtinCount + index, result));
      } finally {
        setIsCheckingSingle(null);
      }
    },
    [customTargets, builtinCount]
  );

  const uniqueProviders = useMemo(() => {
    return new Set(allTargets.map((tg) => tg.provider)).size;
  }, [allTargets]);

  const statCards = useMemo(() => [
    { labelKey: "clean"    as const, value: stats.clean,    colorD: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30", colorL: "from-emerald-50 to-white border-emerald-200", textD: "text-emerald-400", textL: "text-emerald-600" },
    { labelKey: "blocked"  as const, value: stats.blocked,  colorD: "from-red-500/20 to-red-500/5 border-red-500/30",             colorL: "from-red-50 to-white border-red-200",         textD: "text-red-400",     textL: "text-red-600" },
    { labelKey: "error"    as const, value: stats.error,    colorD: "from-amber-500/20 to-amber-500/5 border-amber-500/30",       colorL: "from-amber-50 to-white border-amber-200",     textD: "text-amber-400",   textL: "text-amber-600" },
    { labelKey: "checking" as const, value: stats.checking, colorD: "from-blue-500/20 to-blue-500/5 border-blue-500/30",          colorL: "from-blue-50 to-white border-blue-200",       textD: "text-blue-400",    textL: "text-blue-600" },
    { labelKey: "pending"  as const, value: stats.pending,  colorD: "from-slate-500/20 to-slate-500/5 border-slate-500/30",       colorL: "from-slate-50 to-white border-slate-200",     textD: "text-slate-400",   textL: "text-slate-500" },
  ], [stats]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      dark
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100"
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800"
    }`}>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        dark ? "border-slate-700/50 bg-slate-900/90" : "border-slate-200 bg-white/90"
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-lg shadow-lg shadow-red-500/20">
                🛡
              </span>
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl lg:text-2xl">
                  <span className="truncate">{t("title", lang)}</span>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium sm:text-xs ${
                    dark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                  }`}>
                    TCP 16-20
                  </span>
                </h1>
                <p className={`hidden text-xs sm:block ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {allTargets.length} {t("subtitleRegions", lang)} · {uniqueProviders} {t("totalProviders", lang)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <IconButton
                onClick={() => setLang(lang === "ru" ? "en" : "ru")}
                title={lang === "ru" ? "Switch to English" : "Переключить на русский"}
                icon={lang === "ru" ? "EN" : "RU"}
                dark={dark}
              />
              <IconButton
                onClick={() => setTheme(dark ? "light" : "dark")}
                title={dark ? t("lightTheme", lang) : t("darkTheme", lang)}
                icon={dark ? "☀️" : "🌙"}
                dark={dark}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <label htmlFor="concurrency-select" className={`text-xs whitespace-nowrap ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {t("concurrency", lang)}
              </label>
              <select
                id="concurrency-select"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                disabled={isRunning}
                className={`h-9 rounded-lg border px-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 ${
                  dark ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {[1, 2, 4, 6, 8, 12, 16].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {!isRunning ? (
              <button
                onClick={startChecks}
                disabled={allTargets.length === 0}
                className="h-9 min-w-[10rem] whitespace-nowrap rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                {t("startAll", lang)}
              </button>
            ) : (
              <button
                onClick={stopChecks}
                className="h-9 min-w-[10rem] whitespace-nowrap rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 active:scale-95"
              >
                {t("stop", lang)}
              </button>
            )}

            {progress.completed > 0 && (
              <button
                onClick={exportResults}
                className={`h-9 whitespace-nowrap rounded-lg border px-4 text-sm font-medium transition-colors ${
                  dark ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t("exportJson", lang)}
              </button>
            )}

            {(isRunning || progress.completed > 0) && (
              <div className="ml-auto hidden items-center gap-3 lg:flex">
                <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {progress.completed}/{progress.total}
                </span>
                <div
                  className={`h-2 w-32 overflow-hidden rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className={`w-10 text-right font-mono text-xs ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  {progressPercent}%
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <ProviderSelector
          selected={selectedProviders}
          onChange={(s) => {
            setSelectedProviders(s);
            if (!isRunning) {
              setResults(new Map());
              setProgress({ completed: 0, total: 0 });
            }
          }}
          providerCounts={providerCounts}
          lang={lang}
          theme={theme}
          disabled={isRunning}
        />

        <CustomCheckForm
          lang={lang}
          theme={theme}
          onAddTarget={addCustomTarget}
          customTargets={customTargets}
          onRemoveTarget={removeCustomTarget}
          onClearAll={clearCustomTargets}
          customResults={customResults}
          onCheckSingle={checkSingleCustom}
          isCheckingSingle={isCheckingSingle}
        />

        {(isRunning || progress.completed > 0) && (
          <div className={`mb-6 rounded-xl border p-4 lg:hidden ${
            dark ? "border-slate-700/50 bg-slate-800/50" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className={dark ? "text-slate-400" : "text-slate-500"}>
                {t("progressLabel", lang)} {progress.completed} / {progress.total}
              </span>
              <span className={`font-mono ${dark ? "text-slate-300" : "text-slate-700"}`}>
                {progressPercent}%
              </span>
            </div>
            <div
              className={`h-3 overflow-hidden rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {progress.completed > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {statCards.map((s) => (
              <div key={s.labelKey} className={`rounded-xl border bg-gradient-to-br p-4 ${dark ? s.colorD : s.colorL}`}>
                <div className={`text-2xl font-bold ${dark ? s.textD : s.textL}`}>{s.value}</div>
                <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {t(s.labelKey, lang)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <FilterTabs active={filter} onChange={setFilter} counts={counts} lang={lang} theme={theme} />
        </div>

        <div className={`overflow-hidden rounded-xl border ${
          dark ? "border-slate-700/50 bg-slate-800/50" : "border-slate-200 bg-white shadow-sm"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className={`border-b ${dark ? "border-slate-700/50 bg-slate-800/80" : "border-slate-200 bg-slate-50"}`}>
                  {(["thNum", "thProvider", "thRegion"] as const).map((key) => (
                    <th key={key} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      {t(key, lang)}
                    </th>
                  ))}
                  <th className={`hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sm:table-cell ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {t("thLabel", lang)}
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {t("thStatus", lang)}
                  </th>
                  {(["thAttempts", "thTiming"] as const).map((key) => (
                    <th key={key} className={`hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider md:table-cell ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      {t(key, lang)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? "divide-slate-700/30" : "divide-slate-100"}`}>
                {filteredTargets.map(({ target, index }) => {
                  const r = results.get(index);
                  const status: CheckStatus = r?.status || "pending";
                  return (
                    <TargetRow
                      key={`${target.provider}-${target.region}-${index}`}
                      num={index + 1}
                      target={target}
                      status={status}
                      result={r}
                      isExpanded={expandedRow === index}
                      onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      lang={lang}
                      theme={theme}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTargets.length === 0 && (
            <div className={`px-4 py-12 text-center ${dark ? "text-slate-500" : "text-slate-400"}`}>
              {t("noResults", lang)}
            </div>
          )}
        </div>

        <footer className={`mt-6 rounded-xl border p-4 text-xs ${
          dark ? "border-slate-700/50 bg-slate-800/30 text-slate-500" : "border-slate-200 bg-white text-slate-500 shadow-sm"
        }`}>
          <p className={`mb-2 font-semibold ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {t("howItWorks", lang)}
          </p>
          <p>{t("howItWorksText", lang)}</p>
        </footer>
      </main>
    </div>
  );
}
