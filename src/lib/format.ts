const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

export function formatMoney(n: number): string {
  return money.format(n)
}

const LOCALE: Record<string, string> = { uz: 'uz-Latn-UZ', ru: 'ru-RU', en: 'en-US' }

export function formatDate(ms: number, lang: string): string {
  return new Intl.DateTimeFormat(LOCALE[lang] ?? 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(ms))
}
