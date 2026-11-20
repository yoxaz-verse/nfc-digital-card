<script setup lang="ts">
import FontPicker from './FontPicker.vue'
import type { ElementSelection } from '../types'

defineProps<{ selection: ElementSelection }>()
const emit = defineEmits<{ patch: [patch: Record<string, unknown>]; action: [action: string]; close: [] }>()
const numberValue = (event: Event) => Number((event.target as HTMLInputElement).value)
const stringValue = (event: Event) => (event.target as HTMLInputElement).value
</script>

<template>
  <aside class="element-inspector">
    <div class="inspector-head"><div><span class="eyebrow">Selected element</span><h2>{{ selection.kind }}</h2></div><button aria-label="Close inspector" @click="emit('close')">×</button></div>
    <div class="inspector-scroll">
      <template v-if="selection.kind === 'text'">
        <section><h3>Typography</h3><FontPicker :model-value="selection.fontFamily || 'Arial'" @update:model-value="emit('patch', { fontFamily: $event })" /></section>
        <section class="control-grid three"><label><span>Size</span><input type="number" min="6" max="300" :value="selection.fontSize" @input="emit('patch', { fontSize: numberValue($event) })" /></label><label><span>Weight</span><select :value="selection.fontWeight" @change="emit('patch', { fontWeight: stringValue($event) })"><option>300</option><option>400</option><option>500</option><option>600</option><option>700</option><option>800</option></select></label><label><span>Color</span><input type="color" :value="selection.fill || '#111111'" @input="emit('patch', { fill: stringValue($event) })" /></label></section>
        <section class="button-row"><button :class="{ active: selection.fontStyle === 'italic' }" @click="emit('patch', { fontStyle: selection.fontStyle === 'italic' ? 'normal' : 'italic' })"><i>I</i></button><button :class="{ active: selection.underline }" @click="emit('patch', { underline: !selection.underline })"><u>U</u></button><button v-for="align in ['left','center','right']" :key="align" :class="{ active: selection.textAlign === align }" @click="emit('patch', { textAlign: align })">{{ align === 'left' ? '≡' : align === 'center' ? '≣' : '≡' }}</button></section>
        <section class="control-grid"><label><span>Letter spacing</span><input type="number" min="-200" max="1000" step="10" :value="selection.charSpacing" @input="emit('patch', { charSpacing: numberValue($event) })" /></label><label><span>Line height</span><input type="number" min="0.5" max="3" step="0.05" :value="selection.lineHeight" @input="emit('patch', { lineHeight: numberValue($event) })" /></label></section>
      </template>

      <template v-if="['rectangle','circle','line'].includes(selection.kind)">
        <section><h3>Appearance</h3><div class="control-grid"><label v-if="selection.kind !== 'line'"><span>Fill</span><input type="color" :value="selection.fill || '#d97745'" @input="emit('patch', { fill: stringValue($event) })" /></label><label><span>Border</span><input type="color" :value="selection.stroke && selection.stroke !== 'transparent' ? selection.stroke : '#000000'" @input="emit('patch', { stroke: stringValue($event) })" /></label><label><span>Border width</span><input type="number" min="0" max="50" :value="selection.strokeWidth" @input="emit('patch', { strokeWidth: numberValue($event) })" /></label><label v-if="selection.kind === 'rectangle'"><span>Corner radius</span><input type="number" min="0" max="200" :value="selection.rx" @input="emit('patch', { rx: numberValue($event), ry: numberValue($event) })" /></label></div></section>
      </template>

      <section><h3>Position & size</h3><div class="control-grid three"><label><span>X</span><input type="number" :value="selection.left" @input="emit('patch', { left: numberValue($event) })" /></label><label><span>Y</span><input type="number" :value="selection.top" @input="emit('patch', { top: numberValue($event) })" /></label><label><span>Rotate</span><input type="number" min="-360" max="360" :value="selection.angle" @input="emit('patch', { angle: numberValue($event) })" /></label><label><span>Width</span><input type="number" min="1" :value="selection.width" @input="emit('patch', { width: numberValue($event) })" /></label><label><span>Height</span><input type="number" min="1" :value="selection.height" @input="emit('patch', { height: numberValue($event) })" /></label><label><span>Opacity</span><input type="number" min="0" max="1" step="0.05" :value="selection.opacity" @input="emit('patch', { opacity: numberValue($event) })" /></label></div></section>
      <section><h3>Shadow</h3><div class="control-grid"><label><span>Color</span><input type="color" :value="selection.shadowColor?.slice(0,7) || '#000000'" @input="emit('patch', { shadowColor: stringValue($event) })" /></label><label><span>Blur</span><input type="number" min="0" max="100" :value="selection.shadowBlur || 0" @input="emit('patch', { shadowBlur: numberValue($event) })" /></label><label><span>Offset X</span><input type="number" min="-100" max="100" :value="selection.shadowOffsetX || 0" @input="emit('patch', { shadowOffsetX: numberValue($event) })" /></label><label><span>Offset Y</span><input type="number" min="-100" max="100" :value="selection.shadowOffsetY || 0" @input="emit('patch', { shadowOffsetY: numberValue($event) })" /></label></div></section>
      <section><h3>Arrange</h3><div class="arrange-grid"><button @click="emit('action','front')">To front</button><button @click="emit('action','forward')">Forward</button><button @click="emit('action','backward')">Backward</button><button @click="emit('action','back')">To back</button></div></section>
      <section class="inspector-actions"><button @click="emit('action','duplicate')">⧉ Duplicate</button><button @click="emit('action','lock')">{{ selection.locked ? 'Unlock' : 'Lock' }}</button><button class="danger" @click="emit('action','delete')">Delete</button></section>
    </div>
  </aside>
</template>
