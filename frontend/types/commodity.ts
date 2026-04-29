export interface Commodity {
  value: string
  label: string
  icon?: string
}

export type CommodityKey =
  | 'beras_premium'
  | 'beras_medium'
  | 'jagung'
  | 'kedelai'
  | 'gula_pasir'
  | 'minyak_goreng'
