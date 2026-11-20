export type ProfileGoal = 'creator' | 'business' | 'personal'
export type PlatformType = 'instagram'|'whatsapp'|'tiktok'|'youtube'|'website'|'spotify'|'threads'|'facebook'|'x'|'soundcloud'|'snapchat'|'pinterest'|'patreon'|'twitch'|'applemusic'|'custom'
export type HeaderLayout = 'classic'|'hero'|'banner'|'cutout'|'shape'
export type WallpaperType = 'solid'|'gradient'|'image'
export type ButtonStyle = 'filled'|'outline'|'soft'
export type ButtonShape = 'square'|'rounded'|'pill'
export interface ProfileLink { id:string; platform:PlatformType; label:string; url:string; enabled:boolean; order:number }
export interface ProfileTheme { headerLayout:HeaderLayout; wallpaperType:WallpaperType; background:string; backgroundEnd:string; wallpaperImage?:string; textColor:string; accent:string; font:string; buttonColor:string; buttonTextColor:string; buttonStyle:ButtonStyle; buttonShape:ButtonShape; buttonShadow:boolean }
export interface Profile { id:string; ownerId?:string; slug:string; goal:ProfileGoal; displayName:string; title:string; bio:string; imageAlt:string; imageUrl?:string; links:ProfileLink[]; theme:ProfileTheme; published:boolean; updatedAt:string; publishedAt?:string; previousSlugs:string[] }
export interface OnboardingState { step:number; selectedPlatforms:PlatformType[]; complete:boolean }

export type Face = 'front' | 'back'
export type TemplateCategory = 'Professional' | 'Minimal' | 'Bold' | 'Luxury' | 'Creative' | 'Tech' | 'Dark' | 'Gradient' | 'Photo' | 'QR'

export interface CardFields {
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  accent: string
}

export interface DesignSettings {
  font: string
  frontBackground: string
  backBackground: string
  layout: 'classic' | 'minimal' | 'bold'
}

export type ElementKind = 'text' | 'image' | 'rectangle' | 'circle' | 'line' | 'other'
export interface ElementSelection {
  kind: ElementKind
  id?: string
  templateBound: boolean
  locked: boolean
  left: number
  top: number
  width: number
  height: number
  angle: number
  opacity: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  rx?: number
  fontFamily?: string
  fontSize?: number
  fontWeight?: string | number
  fontStyle?: string
  underline?: boolean
  textAlign?: string
  lineHeight?: number
  charSpacing?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface FontDefinition { family: string; category: 'Sans serif' | 'Serif' | 'Display' | 'Handwriting' | 'Monospace'; system?: boolean }

export interface TemplatePalette { name: string; front: string; back: string; accent: string; foreground: string }
export interface TemplateDefinition {
  id: string
  name: string
  category: TemplateCategory
  description: string
  style: 'line' | 'minimal' | 'bold' | 'luxury' | 'split' | 'grid' | 'gradient' | 'photo' | 'monogram' | 'qr' | 'editorial' | 'neon'
  palettes: TemplatePalette[]
}
export interface BrandAssets { logoDataUrl?: string; photoDataUrl?: string }
export interface QrSettings { enabled: boolean; destination: string; face: Face; color: string }

export interface CanvasSnapshot {
  version: '1.0'
  objects: unknown[]
  background?: string
}

export interface CardProject {
  version: 2
  id: string
  name: string
  fields: CardFields
  design: DesignSettings
  templateId: string
  paletteIndex: number
  assets: BrandAssets
  qr: QrSettings
  canvases: Partial<Record<Face, CanvasSnapshot>>
  updatedAt: string
}

export const CARD = {
  width: 1050,
  height: 600,
  exportWidth: 1050,
  exportHeight: 600,
  ratio: 3.5 / 2,
} as const
