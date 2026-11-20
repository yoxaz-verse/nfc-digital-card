import { defineStore } from 'pinia'
import { get, set, del } from 'idb-keyval'
import { newProject } from '../defaults'
import type { CardProject, Face, CanvasSnapshot } from '../types'

const STORAGE_KEY = 'card-studio:current:v1'

export const useProjectStore = defineStore('project', {
  state: () => ({ project: newProject(), ready: false, saveState: 'Saved' as 'Saved' | 'Saving…' | 'Save failed' }),
  actions: {
    async restore() {
      try {
        const saved = await get<CardProject>(STORAGE_KEY)
        if (saved?.version === 1) this.project = saved
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
    async reset() {
      await del(STORAGE_KEY)
      this.project = newProject()
      await this.save()
    },
  },
})
