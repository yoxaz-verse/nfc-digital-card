import { defineStore } from 'pinia'
import { get, set, del } from 'idb-keyval'
import { newProject } from '../defaults'
import type { CardProject, Face, CanvasSnapshot } from '../types'
import { getTemplate } from '../templates'

const STORAGE_KEY = 'card-studio:current:v1'

export const useProjectStore = defineStore('project', {
  state: () => ({ project: newProject(), ready: false, saveState: 'Saved' as 'Saved' | 'Saving…' | 'Save failed' }),
  actions: {
    async restore() {
      try {
        const saved = await get<Omit<CardProject, 'version'> & { version: number }>(STORAGE_KEY)
        if (saved && (saved.version === 1 || saved.version === 2)) {
          const defaults = newProject()
          const fields = { ...defaults.fields, ...saved.fields }

          // Migrate legacy placeholder defaults if unchanged by user
          if (fields.name === 'Alex Morgan') fields.name = defaults.fields.name
          if (fields.email === 'alex@northandco.com') fields.email = defaults.fields.email
          if (fields.company === 'NORTH & CO.') fields.company = defaults.fields.company
          if (fields.address === '28 Mercer Street · New York') fields.address = defaults.fields.address
          if (fields.phone === '+1 555 014 2089') fields.phone = defaults.fields.phone
          if (fields.website === 'northandco.com') fields.website = defaults.fields.website

          const qr = { ...defaults.qr, ...(saved.qr ?? {}) }
          if (qr.destination === 'https://example.com/alex') qr.destination = defaults.qr.destination

          this.project = {
            ...defaults,
            ...saved,
            fields,
            design: { ...defaults.design, ...(saved.design ?? {}) },
            version: 2,
            templateId: saved.templateId ?? 'executive-line',
            paletteIndex: saved.paletteIndex ?? 0,
            assets: { ...defaults.assets, ...(saved.assets ?? {}) },
            qr,
          }
        }
      } finally {
        this.ready = true
      }
    },
    async save() {
      this.saveState = 'Saving…'
      this.project.updatedAt = new Date().toISOString()
      try {
        await set(STORAGE_KEY, JSON.parse(JSON.stringify(this.project)))
        this.saveState = 'Saved'
      } catch {
        this.saveState = 'Save failed'
      }
    },
    updateFace(face: Face, snapshot: CanvasSnapshot) {
      this.project.canvases[face] = snapshot
      void this.save()
    },
    async selectTemplate(id: string) {
      const template = getTemplate(id)
      const palette = template.palettes[0]!
      this.project.templateId = id
      this.project.paletteIndex = 0
      this.project.design.frontBackground = palette.front
      this.project.design.backBackground = palette.back
      this.project.fields.accent = palette.accent
      this.project.canvases = {}
      await this.save()
    },
    async reset() {
      await del(STORAGE_KEY)
      this.project = newProject()
      await this.save()
    },
  },
})
