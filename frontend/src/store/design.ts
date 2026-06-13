import { create } from 'zustand'
import type { DesignParams, PatternType, HalftoneConfig } from '../types'
import { THEMES } from '../themes/palettes'
import { DUOTONE_PALETTES, extractDuotoneFromPalette } from '../utils/duotone'

interface DesignStore extends DesignParams {
  svgContent: string
  duotonePaperTone: string
  duotoneReadability: { avgContrast: number; minContrast: number; passAA: boolean; passAAA: boolean }
  setParam: <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => void
  setPattern: (p: PatternType) => void
  setTheme: (id: string) => void
  setDuotonePalette: (id: string) => void
  toggleDuotone: () => void
  autoExtractDuotone: () => void
  randomSeed: () => void
  setSvgContent: (s: string) => void
  exportSvg: () => void
  exportPng: () => void
}

const DEFAULT_HALFTONE: HalftoneConfig = {
  enabled: false,
  type: 'dot',
  density: 8,
  size: 3,
  angle: 45
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  pattern: 'spiral',
  seed: 42,
  iterations: 200,
  scale: 1.0,
  rotation: 0,
  strokeWidth: 1.5,
  opacity: 0.8,
  bgColor: '#030712',
  palette: THEMES[0].colors,
  width: 800,
  height: 1000,
  duotoneEnabled: false,
  duotonePalette: 'black-gold',
  duotoneLight: DUOTONE_PALETTES[0].light,
  duotoneDark: DUOTONE_PALETTES[0].dark,
  duotonePreserveHierarchy: true,
  duotoneEnhanceContrast: true,
  duotoneGrayLevels: 4,
  duotoneEnsureReadability: true,
  duotoneShowColorChip: false,
  halftone: { ...DEFAULT_HALFTONE },
  svgContent: '',
  duotonePaperTone: DUOTONE_PALETTES[0].paperTone || DUOTONE_PALETTES[0].light,
  duotoneReadability: { avgContrast: 0, minContrast: 0, passAA: false, passAAA: false },
  setParam: (key, value) => set({ [key]: value } as any),
  setPattern: (p) => set({ pattern: p }),
  setTheme: (id) => {
    const theme = THEMES.find(t => t.id === id)
    if (theme) set({ palette: theme.colors })
  },
  setDuotonePalette: (id) => {
    const palette = DUOTONE_PALETTES.find(p => p.id === id)
    if (palette) set({
      duotonePalette: id,
      duotoneLight: palette.light,
      duotoneDark: palette.dark,
      duotonePaperTone: palette.paperTone || palette.light
    })
  },
  toggleDuotone: () => set({ duotoneEnabled: !get().duotoneEnabled }),
  autoExtractDuotone: () => {
    const { palette } = get()
    const extracted = extractDuotoneFromPalette(palette)
    set({
      duotoneLight: extracted.light,
      duotoneDark: extracted.dark,
      duotonePaperTone: extracted.paperTone,
      duotonePalette: 'custom'
    })
  },
  randomSeed: () => set({ seed: Math.floor(Math.random() * 99999) }),
  setSvgContent: (s) => set({ svgContent: s }),
  exportSvg: () => {
    const { svgContent } = get()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `art-${get().seed}.svg`; a.click()
    URL.revokeObjectURL(url)
  },
  exportPng: () => {
    const { svgContent, width, height } = get()
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob!)
        a.download = `art-${get().seed}.png`; a.click()
      })
    }
    img.src = url
  },
}))
