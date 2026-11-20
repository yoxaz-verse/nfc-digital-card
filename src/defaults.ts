import type { CardFields, CardProject } from './types'

export const defaultFields = (): CardFields => ({
  name: 'Alex Morgan',
  title: 'Creative Director',
  company: 'NORTH & CO.',
  phone: '+1 555 014 2089',
  email: 'alex@northandco.com',
  website: 'northandco.com',
  address: '28 Mercer Street · New York',
  accent: '#d97745',
})

export const newProject = (): CardProject => ({
  version: 1,
  id: crypto.randomUUID(),
  name: 'Untitled business card',
  fields: defaultFields(),
  canvases: {},
  updatedAt: new Date().toISOString(),
})
