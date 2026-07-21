/** Default agency currency — Egypt operations */
export const DEFAULT_CURRENCY = 'EGP'

export function formatMoney(value: number, currency = DEFAULT_CURRENCY): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase()
  const amount = Number.isFinite(value) ? value : 0

  if (code === 'EGP') {
    const formatted = new Intl.NumberFormat('en-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
    return `${formatted} EGP`
  }

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-EG')} ${code}`
  }
}
