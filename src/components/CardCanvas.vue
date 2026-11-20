<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { Canvas, Circle, FabricImage, FabricText, Line, Rect, Shadow, type FabricObject } from 'fabric'
import QRCode from 'qrcode'
import type { CardFields, CanvasSnapshot, Face, DesignSettings, BrandAssets, QrSettings, ElementKind, ElementSelection } from '../types'
import { CARD } from '../types'
import { getTemplate } from '../templates'

const props = defineProps<{ face: Face; fields: CardFields; design: DesignSettings; templateId: string; assets: BrandAssets; qr: QrSettings; snapshot?: CanvasSnapshot }>()
const emit = defineEmits<{ change: [snapshot: CanvasSnapshot, dataUrl: string]; selection: [selection: ElementSelection | null] }>()
let canvas: Canvas | undefined
let isLoading = false
let history: string[] = []
let historyIndex = -1
let timer: number | undefined

const ids: Record<string, string> = {}
const find = (id: string) => canvas?.getObjects().find((o) => (o as FabricObject & { data?: { id?: string } }).data?.id === id)
const templateIds = new Set(['name', 'title', 'company', 'phone', 'email', 'website', 'address', 'monogram', 'logo', 'qr', 'accent', 'accent-line'])

function describe(object?: FabricObject): ElementSelection | null {
  if (!object) return null
  const data = (object as FabricObject & { data?: { id?: string; locked?: boolean } }).data ?? {}
  let kind: ElementKind = 'other'
  if (object instanceof FabricText) kind = 'text'
  else if (object instanceof FabricImage) kind = 'image'
  else if (object instanceof Circle) kind = 'circle'
  else if (object instanceof Line) kind = 'line'
  else if (object instanceof Rect) kind = 'rectangle'
  const shadow = object.shadow instanceof Shadow ? object.shadow : undefined
  const textObject = object instanceof FabricText ? object : undefined
  return {
    kind, id: data.id, templateBound: templateIds.has(data.id ?? ''), locked: Boolean(data.locked),
    left: Math.round(object.left), top: Math.round(object.top), width: Math.round(object.getScaledWidth()), height: Math.round(object.getScaledHeight()), angle: Math.round(object.angle), opacity: object.opacity,
    fill: typeof object.fill === 'string' ? object.fill : undefined, stroke: typeof object.stroke === 'string' ? object.stroke : undefined, strokeWidth: object.strokeWidth, rx: object instanceof Rect ? object.rx : undefined,
    fontFamily: textObject?.fontFamily, fontSize: textObject?.fontSize, fontWeight: textObject?.fontWeight, fontStyle: textObject?.fontStyle, underline: textObject?.underline, textAlign: textObject?.textAlign, lineHeight: textObject?.lineHeight, charSpacing: textObject?.charSpacing,
    shadowColor: shadow?.color, shadowBlur: shadow?.blur, shadowOffsetX: shadow?.offsetX, shadowOffsetY: shadow?.offsetY,
  }
}

function emitSelection() { emit('selection', describe(canvas?.getActiveObject())) }

function text(value: string, options: Record<string, unknown>, id: string) {
  const item = new FabricText(value, { fontFamily: props.design.font, ...options })
  item.set({ data: { id } } as never)
  ids[id] = id
  return item
}

const darkColor = (hex: string) => {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16), g = parseInt(value.slice(2, 4), 16), b = parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 145
}

async function addDataImage(dataUrl: string, options: Record<string, unknown>, id: string) {
  if (!canvas) return
  const img = await FabricImage.fromURL(dataUrl)
  img.set({ ...options, data: { id } } as never)
  canvas.add(img)
  return img
}

async function addQr() {
  if (!canvas || !props.qr.enabled || props.qr.face !== props.face || !/^https?:\/\//i.test(props.qr.destination)) return
  const dataUrl = await QRCode.toDataURL(props.qr.destination, { width: 320, margin: 1, color: { dark: props.qr.color, light: '#ffffff' } })
  const img = await addDataImage(dataUrl, { left: 775, top: 315 }, 'qr')
  img?.scaleToWidth(180)
}

async function buildTemplate() {
  if (!canvas) return
  canvas.clear()
  canvas.backgroundColor = props.face === 'front' ? props.design.frontBackground : props.design.backBackground
  const template = getTemplate(props.templateId)
  const style = template.style
  const bg = props.face === 'front' ? props.design.frontBackground : props.design.backBackground
  const ink = darkColor(bg) ? '#f8f6f0' : '#171717'
  const muted = darkColor(bg) ? '#c2beb5' : '#62605b'
  const accent = props.fields.accent
  const addRect = (options: Record<string, unknown>, id?: string) => { const rect = new Rect(options); if (id) rect.set({ data: { id } } as never); canvas!.add(rect); return rect }

  if (style === 'line') addRect({ left: 0, top: 0, width: 34, height: CARD.height, fill: accent, selectable: false }, 'accent')
  if (style === 'split') addRect({ left: props.face === 'front' ? 0 : 620, top: 0, width: 430, height: 600, fill: accent, selectable: false }, 'accent')
  if (style === 'grid') {
    for (let x = 0; x < CARD.width; x += 75) addRect({ left: x, top: 0, width: 1, height: 600, fill: `${accent}45`, selectable: false })
    for (let y = 0; y < CARD.height; y += 75) addRect({ left: 0, top: y, width: 1050, height: 1, fill: `${accent}45`, selectable: false })
  }
  if (style === 'gradient' || style === 'neon') {
    addRect({ left: -100, top: style === 'neon' ? 510 : -170, width: 620, height: 230, angle: -18, rx: 110, fill: accent, opacity: style === 'neon' ? .9 : .55, selectable: false }, 'accent')
    addRect({ left: 700, top: -90, width: 400, height: 180, angle: 16, rx: 90, fill: '#a678ff', opacity: .42, selectable: false })
  }
  if (style === 'luxury') {
    addRect({ left: 45, top: 45, width: 960, height: 510, fill: 'transparent', stroke: accent, strokeWidth: 2, selectable: false }, 'accent')
    addRect({ left: 520, top: 80, width: 1, height: 440, fill: accent, opacity: .5, selectable: false })
  }
  if (style === 'editorial') addRect({ left: 58, top: 54, width: 7, height: 490, fill: accent, selectable: false }, 'accent')
  if (style === 'photo') addRect({ left: props.face === 'front' ? 610 : 0, top: 0, width: 440, height: 600, fill: accent, opacity: .22, selectable: false }, 'accent')

  if (props.face === 'front') {
    const centered = ['minimal', 'luxury', 'monogram'].includes(style)
    const bold = style === 'bold'
    const left = centered ? 525 : style === 'split' ? 470 : 86
    if (style === 'monogram') {
      canvas.add(text(props.fields.name.split(' ').map(v => v[0]).join('').slice(0, 2), { left: 525, top: 110, originX: 'center', fontSize: 170, fontWeight: 'bold', fill: accent }, 'monogram'))
    }
    canvas.add(text(props.fields.company, { left, top: style === 'monogram' ? 380 : 82, originX: centered ? 'center' : 'left', fontSize: bold ? 38 : 27, fontWeight: 'bold', fill: accent, charSpacing: 140 }, 'company'))
    canvas.add(text(props.fields.name, { left, top: style === 'monogram' ? 445 : bold ? 185 : 260, originX: centered ? 'center' : 'left', fontSize: bold ? 108 : style === 'minimal' ? 64 : 72, fontWeight: 'bold', fill: ink }, 'name'))
    canvas.add(text(props.fields.title, { left, top: style === 'monogram' ? 525 : bold ? 330 : 356, originX: centered ? 'center' : 'left', fontSize: 27, fill: muted }, 'title'))
    if (!['luxury', 'monogram'].includes(style)) addRect({ left: centered ? 465 : left, top: bold ? 450 : 430, width: 120, height: 5, rx: 2, fill: accent, selectable: false }, 'accent-line')
  } else {
    const qrLayout = style === 'qr' || props.qr.enabled
    canvas.add(text(props.fields.company, { left: 72, top: 68, fontSize: 31, fontWeight: 'bold', fill: accent, charSpacing: 120 }, 'company'))
    const rows = [
      ['phone', props.fields.phone], ['email', props.fields.email], ['website', props.fields.website], ['address', props.fields.address],
    ]
    rows.forEach(([id, value], index) => {
      canvas!.add(text(value!, { left: 72, top: 255 + index * 58, fontSize: qrLayout ? 22 : 25, fill: index === 2 ? accent : ink }, id!))
    })
    addRect({ left: 72, top: 205, width: qrLayout ? 630 : 906, height: 2, fill: accent, opacity: .5, selectable: false })
  }
  if (props.assets.logoDataUrl) { const logo = await addDataImage(props.assets.logoDataUrl, { left: 810, top: 65 }, 'logo'); logo?.scaleToWidth(150) }
  await addQr()
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
  canvas?.discardActiveObject(); canvas?.renderAll(); emitSelection(); changed(true)
}

function addText() {
  const item = text('New text', { left: 390, top: 260, fontSize: 40, fill: props.face === 'front' ? '#171717' : '#ffffff' }, crypto.randomUUID())
  canvas?.add(item); canvas?.setActiveObject(item); canvas?.renderAll(); emitSelection(); changed(true)
}

function addShape(kind: 'rectangle' | 'circle' | 'line') {
  if (!canvas) return
  const common = { left: 365, top: 230, fill: props.fields.accent, stroke: 'transparent', strokeWidth: 0, opacity: 1, data: { id: crypto.randomUUID() } }
  const object = kind === 'rectangle' ? new Rect({ ...common, width: 320, height: 150, rx: 10 }) : kind === 'circle' ? new Circle({ ...common, radius: 90 }) : new Line([250, 300, 800, 300], { ...common, fill: undefined, stroke: props.fields.accent, strokeWidth: 8 })
  canvas.add(object); canvas.setActiveObject(object); canvas.renderAll(); emitSelection(); changed(true)
}

function updateSelected(patch: Record<string, unknown>) {
  const object = canvas?.getActiveObject()
  if (!canvas || !object) return
  const next = { ...patch }
  if (typeof next.width === 'number' && object.width) { object.scaleX = next.width / object.width; delete next.width }
  if (typeof next.height === 'number' && object.height) { object.scaleY = next.height / object.height; delete next.height }
  if (['shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'].some((key) => key in next)) {
    const old = object.shadow instanceof Shadow ? object.shadow : new Shadow({ color: '#00000055', blur: 0, offsetX: 0, offsetY: 0 })
    object.set('shadow', new Shadow({ color: String(next.shadowColor ?? old.color), blur: Number(next.shadowBlur ?? old.blur), offsetX: Number(next.shadowOffsetX ?? old.offsetX), offsetY: Number(next.shadowOffsetY ?? old.offsetY) }))
    delete next.shadowColor; delete next.shadowBlur; delete next.shadowOffsetX; delete next.shadowOffsetY
  }
  object.set(next as never); object.setCoords(); canvas.renderAll(); emitSelection(); changed(true)
}

async function duplicateSelected() {
  const object = canvas?.getActiveObject()
  if (!canvas || !object) return
  const clone = await object.clone(['data'])
  clone.set({ left: object.left + 24, top: object.top + 24, data: { id: crypto.randomUUID() } } as never)
  canvas.add(clone); canvas.setActiveObject(clone); canvas.renderAll(); emitSelection(); changed(true)
}

function toggleLock() {
  const object = canvas?.getActiveObject() as (FabricObject & { data?: { id?: string; locked?: boolean } }) | undefined
  if (!canvas || !object) return
  const locked = !object.data?.locked
  object.set({ lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked, lockRotation: locked, hasControls: !locked, data: { ...(object.data ?? {}), locked } } as never)
  canvas.renderAll(); emitSelection(); changed(true)
}

function arrange(action: 'forward' | 'backward' | 'front' | 'back') {
  const object = canvas?.getActiveObject()
  if (!canvas || !object) return
  if (action === 'forward') canvas.bringObjectForward(object)
  else if (action === 'backward') canvas.sendObjectBackwards(object)
  else if (action === 'front') canvas.bringObjectToFront(object)
  else canvas.sendObjectToBack(object)
  canvas.renderAll(); emitSelection(); changed(true)
}

async function addImage(file: File) {
  if (!file.type.startsWith('image/')) return
  const url = URL.createObjectURL(file)
  try {
    const img = await FabricImage.fromURL(url)
    img.scaleToWidth(220)
    img.set({ left: 730, top: 70, data: { id: crypto.randomUUID() } } as never)
    canvas?.add(img); canvas?.setActiveObject(img); canvas?.renderAll(); emitSelection(); changed(true)
  } finally { URL.revokeObjectURL(url) }
}

async function refreshQr() {
  const existing = find('qr')
  if (existing) canvas?.remove(existing)
  await addQr(); canvas?.renderAll(); changed(true)
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

watch(() => props.design, (design) => {
  if (!canvas) return
  canvas.backgroundColor = props.face === 'front' ? design.frontBackground : design.backBackground
  canvas.getObjects().forEach((object) => { if (object instanceof FabricText) object.set('fontFamily', design.font) })
  canvas.renderAll(); changed()
}, { deep: true })

onMounted(async () => {
  canvas = new Canvas(`canvas-${props.face}`, { width: CARD.width, height: CARD.height, preserveObjectStacking: true, selectionColor: 'rgba(217,119,69,.12)' })
  canvas.on('object:modified', () => { emitSelection(); changed() })
  canvas.on('object:added', () => changed())
  canvas.on('object:removed', () => changed())
  canvas.on('selection:created', emitSelection)
  canvas.on('selection:updated', emitSelection)
  canvas.on('selection:cleared', () => emit('selection', null))
  if (props.snapshot) {
    await load(JSON.stringify(props.snapshot))
    history = [JSON.stringify(props.snapshot)]; historyIndex = 0
  } else await buildTemplate()
})

onBeforeUnmount(() => { window.clearTimeout(timer); canvas?.dispose() })
defineExpose({ undo, redo, removeSelected, addText, addShape, addImage, updateSelected, duplicateSelected, toggleLock, arrange, exportData, rebuild: buildTemplate, refreshQr })
</script>

<template>
  <div class="canvas-shell">
    <canvas :id="`canvas-${face}`"></canvas>
  </div>
</template>
