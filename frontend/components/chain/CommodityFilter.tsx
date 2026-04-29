'use client'

interface CommodityFilterProps {
  selected: string
  onChange: (value: string) => void
}

const COMMODITIES = [
  { value: 'all', label: 'Semua Komoditas' },
  { value: 'beras_premium', label: 'Beras Premium' },
  { value: 'beras_medium', label: 'Beras Medium' },
  { value: 'jagung', label: 'Jagung' },
  { value: 'kedelai', label: 'Kedelai' },
  { value: 'gula_pasir', label: 'Gula Pasir' },
  { value: 'minyak_goreng', label: 'Minyak Goreng' },
]

export default function CommodityFilter({ selected, onChange }: CommodityFilterProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {COMMODITIES.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className="commodity-tag"
          style={{
            cursor: 'pointer',
            background: selected === c.value ? 'var(--accent-primary-dim)' : undefined,
            color: selected === c.value ? 'var(--accent-primary)' : undefined,
            borderColor: selected === c.value ? 'var(--accent-primary)' : undefined,
          }}
          id={`filter-${c.value}`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
