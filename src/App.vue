<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { jsPDF } from 'jspdf'
import CardCanvas from './components/CardCanvas.vue'
import FieldPanel from './components/FieldPanel.vue'
import ThreePreview from './components/ThreePreview.vue'
import { useProjectStore } from './stores/project'
import type { CanvasSnapshot, CardFields, Face } from './types'

const store = useProjectStore()
const activeFace = ref<Face>('front')
const canvasRef = ref<InstanceType<typeof CardCanvas>>()
const previewRef = ref<InstanceType<typeof ThreePreview>>()
const textures = ref<Partial<Record<Face, string>>>({})
const selection = ref(false)
const showPreview = ref(true)
const ready = computed(() => store.ready)

onMounted(() => store.restore())

function updateField(key: keyof CardFields, value: string) {
  store.project.fields[key] = value
  void store.save()
}
function canvasChanged(snapshot: CanvasSnapshot, dataUrl: string) {
  textures.value[activeFace.value] = dataUrl
  store.updateFace(activeFace.value, snapshot)
}
async function switchFace(face: Face) { activeFace.value = face; await nextTick(); previewRef.value?.face(face) }
async function addLogo(file: File) { await canvasRef.value?.addImage(file) }

function download(data: string, name: string) {
  const a = document.createElement('a'); a.href = data; a.download = name; a.click()
}
function exportPng() { download(canvasRef.value?.exportData(1) ?? '', `business-card-${activeFace.value}.png`) }
function exportPdf() {
  const front = textures.value.front
  const back = textures.value.back
  if (!front || !back) { alert('Open both faces once before exporting the PDF.'); return }
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [3.5, 2] })
  pdf.addImage(front, 'PNG', 0, 0, 3.5, 2)
  pdf.addPage([3.5, 2], 'landscape'); pdf.addImage(back, 'PNG', 0, 0, 3.5, 2)
  pdf.save('business-card.pdf')
}
async function reset() {
  if (!confirm('Start over? This will replace your locally saved design.')) return
  await store.reset(); await nextTick(); canvasRef.value?.rebuild()
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#"><span class="brand-mark">C</span><span>Card Studio <small>3D</small></span></a>
      <div class="project-title"><input v-model="store.project.name" @change="store.save" /><span class="save-state">● {{ store.saveState }}</span></div>
      <div class="top-actions"><button class="ghost" @click="reset">Start over</button><button class="primary" @click="exportPdf">Export PDF</button></div>
    </header>

    <main v-if="ready" class="workspace">
      <FieldPanel :fields="store.project.fields" :active-face="activeFace" @change="updateField" @logo="addLogo" />
      <section class="editor-area">
        <div class="editor-topline">
          <div class="face-tabs"><button :class="{ active: activeFace === 'front' }" @click="switchFace('front')">Front</button><button :class="{ active: activeFace === 'back' }" @click="switchFace('back')">Back</button></div>
          <div class="view-tabs"><button :class="{ active: !showPreview }" @click="showPreview = false">2D Design</button><button :class="{ active: showPreview }" @click="showPreview = true">3D Preview</button></div>
        </div>

        <div class="stage">
          <div v-show="!showPreview" class="design-stage">
            <CardCanvas :key="activeFace" ref="canvasRef" :face="activeFace" :fields="store.project.fields" :snapshot="store.project.canvases[activeFace]" @change="canvasChanged" @selection="selection = $event" />
          </div>
          <ThreePreview v-show="showPreview" ref="previewRef" :front="textures.front" :back="textures.back" />
        </div>

        <div class="toolbar">
          <button @click="canvasRef?.undo()">↶ <span>Undo</span></button>
          <button @click="canvasRef?.redo()">↷ <span>Redo</span></button>
          <i></i>
          <button @click="canvasRef?.addText()">T <span>Add text</span></button>
          <button :disabled="!selection" class="danger" @click="canvasRef?.removeSelected()">⌫ <span>Delete</span></button>
          <i></i>
          <button @click="exportPng">⇩ <span>Export {{ activeFace }} PNG</span></button>
        </div>
      </section>
    </main>
    <div v-else class="loading">Opening your studio…</div>
  </div>
</template>
