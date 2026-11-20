<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fonts, loadFont } from '../fonts'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const open = ref(false)
const search = ref('')
const category = ref('All')
const categories = ['All', 'Sans serif', 'Serif', 'Display', 'Handwriting', 'Monospace']
const filtered = computed(() => fonts.filter((font) => (category.value === 'All' || font.category === category.value) && font.family.toLowerCase().includes(search.value.toLowerCase())))

async function choose(family: string) { await loadFont(family); emit('update:modelValue', family); open.value = false }
watch(open, (value) => { if (value) filtered.value.slice(0, 15).forEach((font) => void loadFont(font.family)) })
</script>

<template>
  <div class="font-picker">
    <button class="font-trigger" :style="{ fontFamily: modelValue }" @click="open = !open"><span>{{ modelValue }}</span><b>⌄</b></button>
    <div v-if="open" class="font-popover">
      <input v-model="search" autofocus placeholder="Search 100 fonts…" />
      <div class="font-categories"><button v-for="item in categories" :key="item" :class="{ active: category === item }" @click="category = item">{{ item }}</button></div>
      <div class="font-list"><button v-for="font in filtered" :key="font.family" :style="{ fontFamily: font.family }" @mouseenter="loadFont(font.family)" @click="choose(font.family)"><span>{{ font.family }}</span><small>{{ font.category }}</small></button></div>
    </div>
  </div>
</template>
