import type { TemplateDefinition, TemplatePalette } from './types'

const warm: TemplatePalette[] = [
  { name: 'Terracotta', front: '#fdfcf9', back: '#181817', accent: '#d97745', foreground: '#171717' },
  { name: 'Forest', front: '#f7f8f2', back: '#18352b', accent: '#6fa17e', foreground: '#16251e' },
  { name: 'Cobalt', front: '#f7f9ff', back: '#142555', accent: '#4169e1', foreground: '#17213d' },
]
const dark: TemplatePalette[] = [
  { name: 'Gold', front: '#171613', back: '#0c0c0b', accent: '#d6b76d', foreground: '#f7f0df' },
  { name: 'Silver', front: '#1b1d20', back: '#101113', accent: '#b9c0c7', foreground: '#f5f6f7' },
  { name: 'Rose', front: '#211619', back: '#100b0d', accent: '#d8899e', foreground: '#fff4f6' },
]
const vivid: TemplatePalette[] = [
  { name: 'Electric', front: '#11152b', back: '#090b18', accent: '#6df2ff', foreground: '#f3fdff' },
  { name: 'Lime', front: '#151515', back: '#080808', accent: '#c8ff42', foreground: '#ffffff' },
  { name: 'Violet', front: '#20133c', back: '#10091e', accent: '#b681ff', foreground: '#faf7ff' },
]

export const templates: TemplateDefinition[] = [
  { id: 'executive-line', name: 'Executive Line', category: 'Professional', description: 'Confident, balanced and boardroom-ready.', style: 'line', palettes: warm },
  { id: 'pure-minimal', name: 'Pure Minimal', category: 'Minimal', description: 'Generous space with quiet typography.', style: 'minimal', palettes: warm },
  { id: 'bold-type', name: 'Bold Type', category: 'Bold', description: 'Oversized type that makes a statement.', style: 'bold', palettes: vivid },
  { id: 'midnight-gold', name: 'Midnight Gold', category: 'Luxury', description: 'Dark, refined and premium.', style: 'luxury', palettes: dark },
  { id: 'creative-split', name: 'Creative Split', category: 'Creative', description: 'Graphic color blocks for modern studios.', style: 'split', palettes: warm },
  { id: 'tech-grid', name: 'Tech Grid', category: 'Tech', description: 'Structured geometry for builders.', style: 'grid', palettes: vivid },
  { id: 'aurora-gradient', name: 'Aurora Gradient', category: 'Gradient', description: 'Vibrant color with soft depth.', style: 'gradient', palettes: vivid },
  { id: 'studio-photo', name: 'Studio Photo', category: 'Photo', description: 'Put a portrait or product front and center.', style: 'photo', palettes: warm },
  { id: 'monogram', name: 'Monogram', category: 'Professional', description: 'A personal mark with editorial detail.', style: 'monogram', palettes: dark },
  { id: 'contact-qr', name: 'Contact QR', category: 'QR', description: 'Designed to connect in one scan.', style: 'qr', palettes: warm },
  { id: 'soft-editorial', name: 'Soft Editorial', category: 'Minimal', description: 'Elegant type and subtle composition.', style: 'editorial', palettes: warm },
  { id: 'neon-edge', name: 'Neon Edge', category: 'Dark', description: 'High-energy contrast for night mode.', style: 'neon', palettes: vivid },
]

export const getTemplate = (id: string) => templates.find((template) => template.id === id) ?? templates[0]!
