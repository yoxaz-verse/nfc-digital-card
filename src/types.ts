export type Face = 'front' | 'back'

export interface CardFields {
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  accent: string
}

export interface CanvasSnapshot {
  version: '1.0'
  objects: unknown[]
  background?: string
}

export interface CardProject {
  version: 1
  id: string
  name: string
  fields: CardFields
  canvases: Partial<Record<Face, CanvasSnapshot>>
  updatedAt: string
}

export const CARD = {
  width: 1050,
  height: 600,
  exportWidth: 1050,
  exportHeight: 600,
  ratio: 3.5 / 2,
} as const
