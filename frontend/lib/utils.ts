/** Chinese relative time string from an ISO 8601 timestamp */
export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return '剛才'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前`
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} 天前`
  return new Date(iso).toISOString().slice(0, 10)
}

/** Format a large number with K/M suffix */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export const countryFlag: Record<string, string> = {
  TH: '🇹🇭', VN: '🇻🇳', ID: '🇮🇩', PH: '🇵🇭', MY: '🇲🇾', TW: '🇹🇼',
}

export const countryName: Record<string, string> = {
  TH: '泰國', VN: '越南', ID: '印尼', PH: '菲律賓', MY: '馬來西亞', TW: '台灣',
}
