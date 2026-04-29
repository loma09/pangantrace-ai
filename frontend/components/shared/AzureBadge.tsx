interface AzureBadgeProps {
  service: string
}

export default function AzureBadge({ service }: AzureBadgeProps) {
  return (
    <span className="azure-badge">
      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cloud</span>
      {service}
    </span>
  )
}
