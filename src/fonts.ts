import type { FontDefinition } from './types'

const groups: Record<FontDefinition['category'], string[]> = {
  'Sans serif': ['Arial', 'DM Sans', 'Manrope', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Raleway', 'Work Sans', 'Source Sans 3', 'Rubik', 'Karla', 'Mulish', 'Ubuntu', 'Figtree', 'Outfit', 'Plus Jakarta Sans', 'Urbanist', 'Barlow', 'Cabin', 'Exo 2', 'Josefin Sans', 'Quicksand', 'Space Grotesk', 'Sora', 'Lexend', 'Archivo', 'Assistant', 'Hind', 'Noto Sans', 'PT Sans', 'Titillium Web'],
  'Serif': ['Georgia', 'Playfair Display', 'Merriweather', 'Lora', 'Libre Baskerville', 'Cormorant Garamond', 'DM Serif Display', 'EB Garamond', 'Crimson Text', 'Bitter', 'Noto Serif', 'PT Serif', 'Source Serif 4', 'Spectral', 'Alegreya', 'Bodoni Moda', 'Cardo', 'Cinzel', 'Fraunces', 'Prata', 'Roboto Slab', 'Zilla Slab'],
  'Display': ['Bebas Neue', 'Oswald', 'Anton', 'Abril Fatface', 'Alfa Slab One', 'Archivo Black', 'Black Ops One', 'Bungee', 'Concert One', 'Fjalla One', 'Fredoka', 'Lobster', 'Passion One', 'Permanent Marker', 'Righteous', 'Russo One', 'Staatliches', 'Syncopate', 'Unbounded', 'Yeseva One'],
  'Handwriting': ['Caveat', 'Dancing Script', 'Pacifico', 'Satisfy', 'Great Vibes', 'Sacramento', 'Allura', 'Amatic SC', 'Indie Flower', 'Kalam', 'Kaushan Script', 'Marck Script', 'Patrick Hand', 'Shadows Into Light'],
  'Monospace': ['Courier New', 'Roboto Mono', 'Space Mono', 'IBM Plex Mono', 'Source Code Pro', 'JetBrains Mono', 'Fira Code', 'Inconsolata', 'Ubuntu Mono'],
}

const system = new Set(['Arial', 'Georgia', 'Courier New'])
export const fonts: FontDefinition[] = Object.entries(groups).flatMap(([category, families]) => families.map((family) => ({ family, category: category as FontDefinition['category'], system: system.has(family) })))
const loaded = new Set<string>(['Arial', 'Georgia', 'Courier New', 'DM Sans', 'Manrope'])

export async function loadFont(family: string) {
  if (loaded.has(family)) return
  const id = `font-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`
    document.head.appendChild(link)
  }
  try { await document.fonts.load(`16px "${family}"`); loaded.add(family) } catch { /* browser will use the fallback */ }
}
