<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { templates } from '../templates'
import { useProjectStore } from '../stores/project'
import type { TemplateCategory, TemplateDefinition } from '../types'

const store = useProjectStore()
const router = useRouter()
const activeCategory = ref<'All' | TemplateCategory>('All')
const search = ref('')
const categories: ('All' | TemplateCategory)[] = ['All', 'Professional', 'Minimal', 'Bold', 'Luxury', 'Creative', 'Tech', 'Dark', 'Gradient', 'Photo', 'QR']
const filtered = computed(() => templates.filter((item) => (activeCategory.value === 'All' || item.category === activeCategory.value) && `${item.name} ${item.category}`.toLowerCase().includes(search.value.toLowerCase())))

const displayName = computed(() => store.project.fields.name || 'Arjun Menon')
const displayTitle = computed(() => store.project.fields.title || 'Creative Director')
const displayCompany = computed(() => store.project.fields.company || 'MALABAR TECH')
const displayEmail = computed(() => store.project.fields.email || 'arjun@malabartech.in')
const displayPhone = computed(() => store.project.fields.phone || '+91 98470 23456')
const monogramInitials = computed(() => {
  const parts = displayName.value.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : (parts[0]?.[1] ?? '')
  return (first + last).toUpperCase() || 'AM'
})

onMounted(() => store.restore())
async function choose(template: TemplateDefinition) {
  const card = await store.create()
  await store.selectTemplate(template.id)
  await router.push(`/cards/${card.id}/edit`)
}
</script>

<template>
  <div class="template-page">
    <header class="template-nav">
      <RouterLink class="brand" to="/"><span class="brand-mark">C</span><span>Card Studio <small>3D</small></span></RouterLink>
      <RouterLink class="back-link" to="/dashboard">← Workspace</RouterLink>
    </header>
    <main class="template-main">
      <div class="template-intro">
        <span class="hero-kicker">Start with a design</span>
        <h1>Choose your template.</h1>
        <p>Every design includes a coordinated front and back. Your details remain editable, whichever style you choose.</p>
      </div>
      <div class="template-tools">
        <div class="category-scroll"><button v-for="category in categories" :key="category" :class="{ active: activeCategory === category }" @click="activeCategory = category">{{ category }}</button></div>
        <label class="template-search"><span>⌕</span><input v-model="search" placeholder="Search templates" /></label>
      </div>
      <div class="template-grid">
        <article v-for="template in filtered" :key="template.id" class="template-card" :class="`style-${template.style}`" @click="choose(template)">
          <div class="template-preview" :style="{ '--front': template.palettes[0]!.front, '--back': template.palettes[0]!.back, '--accent': template.palettes[0]!.accent, '--ink': template.palettes[0]!.foreground }">
            <div class="mini-card mini-front"><i></i><b>{{ template.style === 'monogram' ? monogramInitials : displayName }}</b><small>{{ displayTitle }}</small><em>{{ displayCompany }}</em></div>
            <div class="mini-card mini-back"><span>{{ displayEmail }}</span><span>{{ displayPhone }}</span><q v-if="template.style === 'qr'">▦</q></div>
          </div>
          <div class="template-meta"><div><span>{{ template.category }}</span><h2>{{ template.name }}</h2><p>{{ template.description }}</p></div><button aria-label="Use template">→</button></div>
        </article>
      </div>
      <p v-if="!filtered.length" class="empty-templates">No templates match that search.</p>
    </main>
  </div>
</template>
