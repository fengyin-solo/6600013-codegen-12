export type PatternType = 'spiral' | 'fractal' | 'wave' | 'circles' | 'voronoi' | 'noise'

export type HalftoneType = 'none' | 'dot' | 'line' | 'circle'

export interface HalftoneConfig {
  enabled: boolean
  type: HalftoneType
  density: number
  size: number
  angle: number
}

export interface DesignParams {
  pattern: PatternType
  seed: number
  iterations: number
  scale: number
  rotation: number
  strokeWidth: number
  opacity: number
  bgColor: string
  palette: string[]
  width: number
  height: number
  duotoneEnabled: boolean
  duotonePalette: string
  duotoneLight: string
  duotoneDark: string
  duotonePreserveHierarchy: boolean
  duotoneEnhanceContrast: boolean
  duotoneGrayLevels: number
  duotoneEnsureReadability: boolean
  duotoneShowColorChip: boolean
  duotonePaperTone: string
  halftone: HalftoneConfig
}

export interface ColorTheme {
  id: string
  name: string
  colors: string[]
}
