export type Lang = "ru" | "en";

export const translations = {
  title: {
    ru: "Проверка DPI",
    en: "DPI Checker",
  },
  subtitleRegions: {
    ru: "эндпоинтов",
    en: "endpoints",
  },
  totalProviders: {
    ru: "провайдеров",
    en: "providers",
  },
  concurrency: {
    ru: "Параллелизм:",
    en: "Concurrency:",
  },
  startAll: {
    ru: "▶ Запустить проверку",
    en: "▶ Start All Checks",
  },
  stop: {
    ru: "⏹ Остановить",
    en: "⏹ Stop",
  },
  exportJson: {
    ru: "📥 Экспорт JSON",
    en: "📥 Export JSON",
  },
  progressLabel: {
    ru: "Прогресс:",
    en: "Progress:",
  },
  clean: {
    ru: "Доступен",
    en: "Clean",
  },
  blocked: {
    ru: "Заблокирован",
    en: "Blocked",
  },
  error: {
    ru: "Ошибка",
    en: "Error",
  },
  checking: {
    ru: "Проверка…",
    en: "Checking…",
  },
  pending: {
    ru: "Ожидание",
    en: "Pending",
  },
  filterAll: {
    ru: "Все",
    en: "All",
  },
  filterBlocked: {
    ru: "Заблокированные",
    en: "Blocked",
  },
  filterClean: {
    ru: "Доступные",
    en: "Clean",
  },
  thNum: {
    ru: "#",
    en: "#",
  },
  thProvider: {
    ru: "Провайдер",
    en: "Provider",
  },
  thRegion: {
    ru: "Регион",
    en: "Region",
  },
  thLabel: {
    ru: "Описание",
    en: "Label",
  },
  thStatus: {
    ru: "Статус",
    en: "Status",
  },
  thAttempts: {
    ru: "Попытки",
    en: "Attempts",
  },
  thTiming: {
    ru: "Время",
    en: "Timing",
  },
  endpoint: {
    ru: "Адрес:",
    en: "Endpoint:",
  },
  transferSize: {
    ru: "Размер передачи:",
    en: "Transfer Size:",
  },
  transferSizeNA: {
    ru: "Н/Д (непрозрачный)",
    en: "N/A (opaque)",
  },
  detail: {
    ru: "Детали:",
    en: "Detail:",
  },
  bytes: {
    ru: "байт",
    en: "bytes",
  },
  howItWorks: {
    ru: "Как это работает",
    en: "How it works",
  },
  howItWorksText: {
    ru: "Инструмент отправляет fetch-запросы в режиме no-cors к эндпоинтам облачных провайдеров. DPI-системы обычно разрешают TCP-рукопожатие и TLS-согласование, а затем разрывают соединение после инспекции 16–20 КБ потока данных. Детектор определяет это через анализ сетевых ошибок, временных паттернов и Performance Resource Timing API. Каждый эндпоинт тестируется 3 раза с экспоненциальной задержкой для минимизации ложных срабатываний.",
    en: "This tool sends fetch requests in no-cors mode to cloud provider endpoints. DPI systems typically allow the TCP handshake and TLS negotiation to complete, then sever the connection after inspecting 16–20 KB of the data stream. The checker detects this by analyzing network errors, timing patterns, and the Performance Resource Timing API. Each endpoint is tested 3 times with exponential backoff to minimize false positives.",
  },
  noResults: {
    ru: "Нет целей, соответствующих текущему фильтру.",
    en: "No targets match the current filter.",
  },
  lightTheme: {
    ru: "Светлая тема",
    en: "Light theme",
  },
  darkTheme: {
    ru: "Тёмная тема",
    en: "Dark theme",
  },
  customCheckTitle: {
    ru: "Проверка произвольного хоста",
    en: "Custom Host Check",
  },
  customCheckDesc: {
    ru: "Добавьте URL для проверки на предмет DPI-блокировок. Укажите полный HTTPS-адрес.",
    en: "Add a URL to check for DPI blocking. Provide a full HTTPS address.",
  },
  customUrl: {
    ru: "URL (https://...)",
    en: "URL (https://...)",
  },
  customRegion: {
    ru: "Регион",
    en: "Region",
  },
  customLabel: {
    ru: "Описание",
    en: "Label",
  },
  customAdd: {
    ru: "Добавить",
    en: "Add",
  },
  customCheck: {
    ru: "Проверить",
    en: "Check",
  },
  customAddAndCheck: {
    ru: "Добавить и проверить",
    en: "Add & Check",
  },
  customClearAll: {
    ru: "Очистить",
    en: "Clear All",
  },
  customInvalidUrl: {
    ru: "Введите корректный HTTPS URL",
    en: "Enter a valid HTTPS URL",
  },
  customTargets: {
    ru: "Пользовательские цели",
    en: "Custom Targets",
  },
  customAdded: {
    ru: "добавлено",
    en: "added",
  },
  selectAll: {
    ru: "Все",
    en: "All",
  },
  deselectAll: {
    ru: "Сбросить",
    en: "Deselect",
  },
  selectedCount: {
    ru: "выбрано",
    en: "selected",
  },
  selectedEndpoints: {
    ru: "эндпоинтов к проверке",
    en: "endpoints to check",
  },
  providerSelector: {
    ru: "Провайдеры",
    en: "Providers",
  },
  regionsShort: {
    ru: "рег.",
    en: "reg.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
