<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { Canvas, FabricImage, FabricText, Rect, type FabricObject } from 'fabric'
import type { CardFields, CanvasSnapshot, Face } from '../types'
import { CARD } from '../types'

const props = defineProps<{ face: Face; fields: CardFields; snapshot?: CanvasSnapshot }>()
const emit = defineEmits<{ change: [snapshot: CanvasSnapshot, dataUrl: string]; selection: [active: boolean] }>()
let canvas: Canvas | undefined
let isLoading = false
let history: string[] = []
let historyIndex = -1
let timer: number | undefined

const ids: Record<string, string> = {}
const find = (id: string) => canvas?.getObjects().find((o) => (o as FabricObject & { data?: { id?: string } }).data?.id === id)

function text(value: string, options: Record<string, unknown>, id: string) {
  const item = new FabricText(value, { fontFamily: 'Arial', ...options })
  item.set({ data: { id } } as never)
  ids[id] = id
  return item
}

function buildTemplate() {
  if (!canvas) return
  canvas.clear()
  canvas.backgroundColor = '#fdfcf9'
  if (props.face === 'front') {
    const bar = new Rect({ left: 0, top: 0, width: 34, height: CARD.height, fill: props.fields.accent, selectable: false })
    bar.set({ data: { id: 'accent' } } as never)
    canvas.add(bar)
    canvas.add(text(props.fields.company, { left: 86, top: 82, fontSize: 29, fontWeight: 'bold', fill: props.fields.accent, charSpacing: 140 }, 'company'))
    canvas.add(text(props.fields.name, { left: 86, top: 260, fontSize: 72, fontWeight: 'bold', fill: '#171717' }, 'name'))
    canvas.add(text(props.fields.title, { left: 90, top: 356, fontSize: 29, fill: '#62605b' }, 'title'))
    canvas.add(new Rect({ left: 88, top: 430, width: 120, height: 5, rx: 2, fill: props.fields.accent, selectable: false }))
  } else {
    canvas.backgroundColor = '#181817'
    canvas.add(text(props.fields.company, { left: 72, top: 68, fontSize: 31, fontWeight: 'bold', fill: props.fields.accent, charSpacing: 120 }, 'company'))
    const rows = [
      ['phone', props.fields.phone], ['email', props.fields.email], ['website', props.fields.website], ['address', props.fields.address],
    ]
    rows.forEach(([id, value], index) => {
      canvas!.add(text(value!, { left: 72, top: 270 + index * 55, fontSize: 25, fill: index === 2 ? props.fields.accent : '#f4f1e9' }, id!))
    })
    canvas.add(new Rect({ left: 72, top: 214, width: 906, height: 2, fill: '#3d3c39', selectable: false }))
  }
  canvas.renderAll()
  changed(true)
}

function changed(immediate = false) {
  if (!canvas || isLoading) return
  window.clearTimeout(timer)
  const run = () => {
    if (!canvas) return
    const json = (canvas.toJSON as (properties?: string[]) => unknown)(['data']) as CanvasSnapshot
    json.version = '1.0'
    json.background = canvas.backgroundColor as string
    const serialized = JSON.stringify(json)
    if (history[historyIndex] !== serialized) {
      history = history.slice(0, historyIndex + 1)
      history.push(serialized)
      if (history.length > 50) history.shift()
      historyIndex = history.length - 1
    }
    emit('change', json, canvas.toDataURL({ format: 'png', multiplier: 1 }))
  }
  if (immediate) run()
  else timer = window.setTimeout(run, 180)
}

async function load(serialized: string) {
  if (!canvas) return
  isLoading = true
  await canvas.loadFromJSON(serialized)
  canvas.renderAll()
  isLoading = false
  const json = (canvas.toJSON as (properties?: string[]) => unknown)(['data']) as CanvasSnapshot
  emit('change', json, canvas.toDataURL({ format: 'png', multiplier: 1 }))
}

async function undo() { if (historyIndex > 0) { historyIndex--; await load(history[historyIndex]!) } }
async function redo() { if (historyIndex < history.length - 1) { historyIndex++; await load(history[historyIndex]!) } }

function removeSelected() {
  const selected = canvas?.getActiveObjects() ?? []
  selected.forEach((object) => canvas?.remove(object))
  canvas?.discardActiveObject(); canvas?.renderAll(); changed(true)
}

function addText() {
  canvas?.add(text('New text', { left: 390, top: 260, fontSize: 40, fill: props.face === 'front' ? '#171717' : '#ffffff' }, crypto.randomUUID()))
  canvas?.renderAll(); changed(true)
}

async function addImage(file: File) {
  if (!file.type.startsWith('image/')) return
  const url = URL.createObjectURL(file)
  try {
    const img = await FabricImage.fromURL(url)
    img.scaleToWidth(220)
    img.set({ left: 730, top: 70, data: { id: crypto.randomUUID() } } as never)
    canvas?.add(img); canvas?.setActiveObject(img); canvas?.renderAll(); changed(true)
  } finally { URL.revokeObjectURL(url) }
}

function exportData(multiplier = 1) { return canvas?.toDataURL({ format: 'png', multiplier }) ?? '' }

watch(() => props.fields, (fields) => {
  if (!canvas) return
  Object.entries(fields).forEach(([key, value]) => {
    if (key === 'accent') {
      find('accent')?.set('fill', value)
      find('company')?.set('fill', value)
      if (props.face === 'back') find('website')?.set('fill', value)
    } else find(key)?.set('text', value)
  })
  canvas.renderAll(); changed()
}, { deep: true })

onMounted(async () => {
  canvas = new Canvas(`canvas-${props.face}`, { width: CARD.width, height: CARD.height, preserveObjectStacking: true, selectionColor: 'rgba(217,119,69,.12)' })
  canvas.on('object:modified', () => changed())
  canvas.on('object:added', () => changed())
  canvas.on('object:removed', () => changed())
  canvas.on('selection:created', () => emit('selection', true))
  canvas.on('selection:cleared', () => emit('selection', false))
  if (props.snapshot) {
    await load(JSON.stringify(props.snapshot))
    history = [JSON.stringify(props.snapshot)]; historyIndex = 0
  } else buildTemplate()
})

onBeforeUnmount(() => { window.clearTimeout(timer); canvas?.dispose() })
defineExpose({ undo, redo, removeSelected, addText, addImage, exportData, rebuild: buildTemplate })
</script>

<template>
  <div class="canvas-shell">
    <canvas :id="`canvas-${face}`"></canvas>
  </div>
</template>
