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
  version: 3,
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
  qr: { enabled: true, destination: '', face: 'back', color: '#181817' },
  destinationMode: 'profile',
  nfcDestination: '',
  canvases: {},
  updatedAt: new Date().toISOString(),
})
