import type { CardFields, CardProject } from './types'

export const defaultFields = (): CardFields => ({
  name: 'Arjun Menon',
  title: 'Creative Director',
  company: 'MALABAR TECH',
  phone: '+91 98470 23456',
  email: 'arjun@malabartech.in',
  website: 'malabartech.in',
  address: 'Infopark Phase II · Kochi, Kerala',
  accent: '#d97745',
})

export const newProject = (): CardProject => ({
  version: 2,
  id: crypto.randomUUID(),
  name: 'Untitled business card',
  fields: defaultFields(),
  design: {
    font: 'Arial',
    frontBackground: '#fdfcf9',
    backBackground: '#181817',
    layout: 'classic',
  },
  templateId: 'executive-line',
  paletteIndex: 0,
  assets: {},
  qr: { enabled: false, destination: 'https://cardstudio.app/u/arjun-menon', face: 'back', color: '#181817' },
  canvases: {},
  updatedAt: new Date().toISOString(),
})
