<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { jsPDF } from 'jspdf'
import CardCanvas from '../components/CardCanvas.vue'
import FieldPanel from '../components/FieldPanel.vue'
import ThreePreview from '../components/ThreePreview.vue'
import { useProjectStore } from '../stores/project'
import type { CanvasSnapshot, CardFields, DesignSettings, Face, QrSettings } from '../types'
import { getTemplate } from '../templates'

const store = useProjectStore()
const activeFace = ref<Face>('front')
const mobileTab = ref<'details' | 'design' | 'preview'>('details')
const frontCanvas = ref<InstanceType<typeof CardCanvas>>()
const backCanvas = ref<InstanceType<typeof CardCanvas>>()
const previewRef = ref<InstanceType<typeof ThreePreview>>()
const textures = ref<Partial<Record<Face, string>>>({})
const selection = ref(false)
const ready = computed(() => store.ready)
const activeCanvas = computed(() => activeFace.value === 'front' ? frontCanvas.value : backCanvas.value)

onMounted(() => store.restore())
function updateField(key: keyof CardFields, value: string) { store.project.fields[key] = value; void store.save() }
function updateDesign(key: keyof DesignSettings, value: string) { (store.project.design[key] as string) = value; void store.save() }
function canvasChanged(face: Face, snapshot: CanvasSnapshot, dataUrl: string) { textures.value[face] = dataUrl; store.updateFace(face, snapshot) }
async function switchFace(face: Face) { activeFace.value = face; await nextTick(); previewRef.value?.face(face) }
async function addLogo(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
  store.project.assets.logoDataUrl = dataUrl; await store.save(); mobileTab.value = 'design'; await nextTick(); await frontCanvas.value?.rebuild(); await backCanvas.value?.rebuild()
}
async function applyPalette(index: number) {
  const palette = getTemplate(store.project.templateId).palettes[index]!
  store.project.paletteIndex = index; store.project.design.frontBackground = palette.front; store.project.design.backBackground = palette.back; store.project.fields.accent = palette.accent
  await store.save(); await nextTick(); await frontCanvas.value?.rebuild(); await backCanvas.value?.rebuild()
}
async function updateQr(key: keyof QrSettings, value: string | boolean) {
  ;(store.project.qr[key] as string | boolean) = value; await store.save(); await frontCanvas.value?.refreshQr(); await backCanvas.value?.refreshQr()
}
function download(data: string, name: string) { const a = document.createElement('a'); a.href = data; a.download = name; a.click() }
function exportPng() { download(activeCanvas.value?.exportData(1) ?? '', `business-card-${activeFace.value}.png`) }
function exportPdf() {
  const front = frontCanvas.value?.exportData(1); const back = backCanvas.value?.exportData(1)
  if (!front || !back) return
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [3.5, 2] })
  pdf.addImage(front, 'PNG', 0, 0, 3.5, 2); pdf.addPage([3.5, 2], 'landscape'); pdf.addImage(back, 'PNG', 0, 0, 3.5, 2); pdf.save('business-card.pdf')
}
async function reset() { if (!confirm('Start over? This will replace your locally saved design.')) return; await store.reset(); await nextTick(); frontCanvas.value?.rebuild(); backCanvas.value?.rebuild() }
</script>

<template>
  <div class="app-shell editor-shell">
    <header class="topbar editor-header">
      <RouterLink class="brand" to="/"><span class="brand-mark">C</span><span>Card Studio <small>3D</small></span></RouterLink>
      <div class="project-title"><input v-model="store.project.name" @change="store.save" /><span class="save-state">● {{ store.saveState }}</span></div>
      <div class="top-actions"><button class="ghost" @click="reset">Start over</button><button class="primary" @click="exportPdf">Export PDF</button></div>
    </header>
    <main v-if="ready" class="workspace" :data-mobile-tab="mobileTab">
      <FieldPanel class="details-pane" :fields="store.project.fields" :design="store.project.design" :active-face="activeFace" :template-id="store.project.templateId" :palette-index="store.project.paletteIndex" :qr="store.project.qr" @change="updateField" @design="updateDesign" @logo="addLogo" @palette="applyPalette" @qr="updateQr" />
      <section class="editor-area">
        <div class="editor-topline">
          <div class="face-tabs"><button :class="{ active: activeFace === 'front' }" @click="switchFace('front')">Front</button><button :class="{ active: activeFace === 'back' }" @click="switchFace('back')">Back</button></div>
          <div class="view-tabs"><button :class="{ active: mobileTab === 'design' }" @click="mobileTab = 'design'">2D Design</button><button :class="{ active: mobileTab === 'preview' }" @click="mobileTab = 'preview'">3D Preview</button></div>
        </div>
        <div class="stage">
          <div class="design-stage" :class="{ 'stage-hidden': mobileTab === 'preview' }">
            <CardCanvas v-show="activeFace === 'front'" ref="frontCanvas" face="front" :fields="store.project.fields" :design="store.project.design" :template-id="store.project.templateId" :assets="store.project.assets" :qr="store.project.qr" :snapshot="store.project.canvases.front" @change="(s, u) => canvasChanged('front', s, u)" @selection="selection = $event" />
            <CardCanvas v-show="activeFace === 'back'" ref="backCanvas" face="back" :fields="store.project.fields" :design="store.project.design" :template-id="store.project.templateId" :assets="store.project.assets" :qr="store.project.qr" :snapshot="store.project.canvases.back" @change="(s, u) => canvasChanged('back', s, u)" @selection="selection = $event" />
          </div>
          <ThreePreview :class="{ 'stage-hidden': mobileTab !== 'preview' }" ref="previewRef" :front="textures.front" :back="textures.back" />
        </div>
        <div class="toolbar">
          <button @click="activeCanvas?.undo()">↶ <span>Undo</span></button><button @click="activeCanvas?.redo()">↷ <span>Redo</span></button><i></i>
          <button @click="activeCanvas?.addText()">T <span>Add text</span></button><button :disabled="!selection" class="danger" @click="activeCanvas?.removeSelected()">⌫ <span>Delete</span></button><i></i>
          <button @click="exportPng">⇩ <span>Export {{ activeFace }} PNG</span></button>
        </div>
      </section>
      <nav class="mobile-nav" aria-label="Editor sections">
        <button :class="{ active: mobileTab === 'details' }" @click="mobileTab = 'details'"><b>☷</b><span>Details</span></button>
        <button :class="{ active: mobileTab === 'design' }" @click="mobileTab = 'design'"><b>✦</b><span>Design</span></button>
        <button :class="{ active: mobileTab === 'preview' }" @click="mobileTab = 'preview'"><b>◇</b><span>Preview</span></button>
      </nav>
    </main>
    <div v-else class="loading">Opening your studio…</div>
  </div>
</template>
