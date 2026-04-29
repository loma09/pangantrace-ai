export interface ChainNode {
  id: string
  name: string
  type: 'producer' | 'distributor' | 'retailer'
  province: string
  volume_in: number
  volume_out: number
  discrepancy_pct: number
}

export interface ChainFlow {
  from: string
  to: string
  volume: number
  date: string
}

export interface ChainResponse {
  commodity: string
  flows: ChainFlow[]
  total_volume: number
  loss_pct: number
}

export interface ChainNodesResponse {
  nodes: ChainNode[]
  total: number
}
