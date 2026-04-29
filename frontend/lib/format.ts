export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('id-ID').format(value)

export const formatDate = (isoString: string): string =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString))

export const formatRelativeTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (hours >= 24) return `${Math.floor(hours / 24)} hari lalu`
  if (hours >= 1) return `${hours} jam lalu`
  return `${minutes} menit lalu`
}

export const getRiskColor = (level: string): string =>
  ({
    critical: '#791F1F',
    high: '#A32D2D',
    medium: '#633806',
    low: '#27500A',
  })[level] ?? '#444441'

export const getRiskBg = (level: string): string =>
  ({
    critical: '#FCEBEB',
    high: '#FCEBEB',
    medium: '#FAEEDA',
    low: '#EAF3DE',
  })[level] ?? '#F1EFE8'
