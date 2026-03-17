export interface AnnotationBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  apiData: ApiData | null
  loading: boolean
}

export interface ApiData {
  title: string
  description: string
  icon?: string
}

export interface DragState {
  isDragging: boolean
  boxId: string | null
  startX: number
  startY: number
  startBoxX: number
  startBoxY: number
}
