<script setup lang="ts">
import type { CardFields } from '../types'

defineProps<{ fields: CardFields; activeFace: 'front' | 'back' }>()
const emit = defineEmits<{ change: [key: keyof CardFields, value: string]; logo: [file: File] }>()

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
      <span class="eyebrow">Template</span>
      <h2>Card details</h2>
      <p>Edit the content, then fine-tune it directly on the canvas.</p>
    </div>
    <div class="field-stack">
      <label v-for="item in items.filter((i) => i.face === activeFace)" :key="item.key">
        <span>{{ item.label }}</span>
        <input :value="fields[item.key]" @input="emit('change', item.key, ($event.target as HTMLInputElement).value)" />
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
    </div>
  </aside>
</template>
