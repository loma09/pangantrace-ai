export const APP_NAME = 'PanganTrace AI'
export const APP_TAGLINE = 'From farm to table — every kilogram, every rupiah, tracked.'

export const COMMODITIES = [
  { value: 'beras_premium', label: 'Beras Premium', icon: '🌾' },
  { value: 'beras_medium', label: 'Beras Medium', icon: '🌾' },
  { value: 'jagung', label: 'Jagung', icon: '🌽' },
  { value: 'kedelai', label: 'Kedelai', icon: '🫘' },
  { value: 'gula_pasir', label: 'Gula Pasir', icon: '🍬' },
  { value: 'minyak_goreng', label: 'Minyak Goreng', icon: '🫗' },
] as const

export const PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kep. Bangka Belitung',
  'Kep. Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
  'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali',
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat',
  'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur',
  'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah',
  'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo',
  'Sulawesi Barat', 'Maluku', 'Maluku Utara', 'Papua',
  'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan',
] as const

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const
