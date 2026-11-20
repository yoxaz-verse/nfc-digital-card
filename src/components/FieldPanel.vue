<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { CardFields, DesignSettings, QrSettings } from '../types'
import { getTemplate } from '../templates'
import FontPicker from './FontPicker.vue'

const props = defineProps<{ fields: CardFields; design: DesignSettings; activeFace: 'front' | 'back'; templateId: string; paletteIndex: number; qr: QrSettings }>()
const emit = defineEmits<{ change: [key: keyof CardFields, value: string]; design: [key: keyof DesignSettings, value: string]; logo: [file: File]; palette: [index: number]; qr: [key: keyof QrSettings, value: string | boolean] }>()
const template = computed(() => getTemplate(props.templateId))

const items: { key: keyof CardFields; label: string; face: 'front' | 'back' }[] = [
  { key: 'name', label: 'Name', face: 'front' },
  { key: 'title', label: 'Job title', face: 'front' },
  { key: 'company', label: 'Company', face: 'front' },
  { key: 'phone', label: 'Phone', face: 'back' },
  { key: 'email', label: 'Email', face: 'back' },
  { key: 'website', label: 'Website', face: 'back' },
  { key: 'address', label: 'Address', face: 'back' },
]

function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('logo', file)
}
</script>

<template>
  <aside class="panel fields-panel">
    <div class="panel-heading">
      <span class="eyebrow">{{ template.category }} template</span>
      <div class="panel-title-row"><h2>{{ template.name }}</h2><RouterLink to="/templates">Change</RouterLink></div>
      <p>All your information stays here. Choose Front or Back to design either side.</p>
    </div>
    <div class="field-stack">
      <label v-for="item in items" :key="item.key">
        <span>{{ item.label }} <small>{{ item.face }}</small></span>
        <input :value="fields[item.key]" @input="emit('change', item.key, ($event.target as HTMLInputElement).value)" />
      </label>
      <div class="field-divider"><span>Style</span></div>
      <label class="palette-label">
        <span>Curated palette</span>
        <div class="palette-row"><button v-for="(palette, index) in template.palettes" :key="palette.name" :class="{ active: paletteIndex === index }" :title="palette.name" @click="emit('palette', index)"><i :style="{ background: palette.front }"></i><i :style="{ background: palette.accent }"></i><i :style="{ background: palette.back }"></i></button></div>
      </label>
      <label>
        <span>Font</span>
        <FontPicker :model-value="design.font" @update:model-value="emit('design', 'font', $event)" />
      </label>
      <label>
        <span>{{ activeFace === 'front' ? 'Front' : 'Back' }} background</span>
        <div class="color-control">
          <input type="color" :value="activeFace === 'front' ? design.frontBackground : design.backBackground" @input="emit('design', activeFace === 'front' ? 'frontBackground' : 'backBackground', ($event.target as HTMLInputElement).value)" />
          <code>{{ activeFace === 'front' ? design.frontBackground : design.backBackground }}</code>
        </div>
      </label>
      <label>
        <span>Accent</span>
        <div class="color-control">
          <input type="color" :value="fields.accent" @input="emit('change', 'accent', ($event.target as HTMLInputElement).value)" />
          <code>{{ fields.accent }}</code>
        </div>
      </label>
      <label class="upload-button">
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" @change="upload" />
        <span>＋ Add logo or image</span>
      </label>
      <div class="field-divider"><span>NFC destination</span></div>
      <label class="qr-url">
        <span>Profile or website URL</span>
        <input type="url" :value="qr.destination" placeholder="https://your-profile.com" @input="emit('qr', 'destination', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="toggle-row"><span>Show QR code</span><input type="checkbox" :checked="qr.enabled" @change="emit('qr', 'enabled', ($event.target as HTMLInputElement).checked)" /></label>
      <label v-if="qr.enabled">
        <span>QR face</span>
        <select :value="qr.face" @change="emit('qr', 'face', ($event.target as HTMLSelectElement).value)"><option value="front">Front</option><option value="back">Back</option></select>
      </label>
      <label v-if="qr.enabled"><span>QR color</span><div class="color-control"><input type="color" :value="qr.color" @input="emit('qr', 'color', ($event.target as HTMLInputElement).value)" /><code>{{ qr.color }}</code></div></label>
    </div>
  </aside>
</template>
