export interface DuotonePalette {
  id: string
  name: string
  light: string
  dark: string
  paperTone?: string
}

export const DUOTONE_PALETTES: DuotonePalette[] = [
  { id: 'black-gold',   name: '黑金',       light: '#D4AF37', dark: '#1a1a1a', paperTone: '#F5F1E8' },
  { id: 'navy-cream',   name: '深蓝米白',    light: '#FFF8E7', dark: '#1E3A5F', paperTone: '#FFF8E7' },
  { id: 'red-cream',    name: '朱红米白',    light: '#FFF5E6', dark: '#8B2500', paperTone: '#FFF5E6' },
  { id: 'green-ivory',  name: '墨绿象牙',    light: '#FFFFF0', dark: '#2D4A3E', paperTone: '#FFFFF0' },
  { id: 'mono',         name: '经典黑白',    light: '#FFFFFF', dark: '#000000', paperTone: '#FFFFFF' },
  { id: 'sepia',        name: '复古棕褐',    light: '#F5E6D3', dark: '#5C4033', paperTone: '#F5E6D3' },
  { id: 'platinum',     name: '铂金银灰',    light: '#E8E8E8', dark: '#4A4A4A', paperTone: '#F0F0F0' },
  { id: 'burgundy',     name: '酒红奶白',    light: '#FFF8DC', dark: '#722F37', paperTone: '#FFF8DC' },
  { id: 'cobalt-kraft', name: '钴蓝牛皮纸',  light: '#C4956A', dark: '#0047AB', paperTone: '#C4956A' },
  { id: 'teal-rice',    name: '竹青米白',    light: '#F8F4E9', dark: '#0D5C63', paperTone: '#F8F4E9' },
  { id: 'crimson-cream',name: '正红米黄',    light: '#FBF5D5', dark: '#A6192E', paperTone: '#FBF5D5' },
  { id: 'ink-wash',     name: '水墨素笺',    light: '#F0EDE5', dark: '#2C2C2C', paperTone: '#F0EDE5' },
]

export type HalftoneType = 'none' | 'dot' | 'line' | 'circle'

export interface HalftoneConfig {
  enabled: boolean
  type: HalftoneType
  density: number
  size: number
  angle: number
}

export const DEFAULT_HALFTONE: HalftoneConfig = {
  enabled: false,
  type: 'dot',
  density: 8,
  size: 3,
  angle: 45
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ]
}

function rgbToLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return rgbToLuminance(r, g, b)
}

function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function convertToDuotone(
  originalColors: string[],
  duotoneLight: string,
  duotoneDark: string,
  preserveHierarchy: boolean = true
): string[] {
  if (originalColors.length === 0) return []

  const luminances = originalColors.map(getLuminance)
  const minLum = Math.min(...luminances)
  const maxLum = Math.max(...luminances)
  const midLum = (minLum + maxLum) / 2

  if (!preserveHierarchy) {
    return originalColors.map((_, i) =>
      luminances[i] >= midLum ? duotoneLight : duotoneDark
    )
  }

  const lightColors: { idx: number; lum: number }[] = []
  const darkColors: { idx: number; lum: number }[] = []

  originalColors.forEach((_, i) => {
    if (luminances[i] >= midLum) {
      lightColors.push({ idx: i, lum: luminances[i] })
    } else {
      darkColors.push({ idx: i, lum: luminances[i] })
    }
  })

  const result: string[] = [...originalColors]

  if (lightColors.length > 0) {
    const lightMin = Math.min(...lightColors.map(c => c.lum))
    const lightMax = Math.max(...lightColors.map(c => c.lum))
    const lightRange = lightMax - lightMin || 1
    lightColors.forEach(c => {
      const t = (c.lum - lightMin) / lightRange
      result[c.idx] = lerpColor(duotoneDark, duotoneLight, 0.6 + t * 0.4)
    })
  }

  if (darkColors.length > 0) {
    const darkMin = Math.min(...darkColors.map(c => c.lum))
    const darkMax = Math.max(...darkColors.map(c => c.lum))
    const darkRange = darkMax - darkMin || 1
    darkColors.forEach(c => {
      const t = (c.lum - darkMin) / darkRange
      result[c.idx] = lerpColor(duotoneDark, duotoneLight, t * 0.4)
    })
  }

  return result
}

export function getDuotoneModifier(
  originalColor: string,
  duotoneLight: string,
  duotoneDark: string
): { strokeMultiplier: number; opacityMultiplier: number } {
  const lum = getLuminance(originalColor)
  const lightLum = getLuminance(duotoneLight)
  const darkLum = getLuminance(duotoneDark)
  const range = Math.abs(lightLum - darkLum) || 1

  const normalized = Math.abs(lum - darkLum) / range

  return {
    strokeMultiplier: 0.6 + normalized * 0.8,
    opacityMultiplier: 0.5 + normalized * 0.5
  }
}

export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1) / 255
  const lum2 = getLuminance(color2) / 255
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function ensureReadablePair(light: string, dark: string, minRatio: number = 4.5): { light: string; dark: string } {
  let l = light
  let d = dark
  let ratio = getContrastRatio(l, d)
  let iterations = 0
  while (ratio < minRatio && iterations < 20) {
    d = darkenColor(d, 0.05)
    l = lightenColor(l, 0.05)
    ratio = getContrastRatio(l, d)
    iterations++
  }
  return { light: l, dark: d }
}

function darkenColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.max(0, Math.round(r * (1 - amount))),
    Math.max(0, Math.round(g * (1 - amount))),
    Math.max(0, Math.round(b * (1 - amount)))
  )
}

function lightenColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount))
  )
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function convertToDuotoneAdvanced(
  originalColors: string[],
  duotoneLight: string,
  duotoneDark: string,
  options: {
    preserveHierarchy?: boolean
    levels?: number
    ensureContrast?: boolean
  } = {}
): string[] {
  if (originalColors.length === 0) return []

  const {
    preserveHierarchy = true,
    levels = 4,
    ensureContrast = true
  } = options

  let light = duotoneLight
  let dark = duotoneDark
  if (ensureContrast) {
    const pair = ensureReadablePair(light, dark)
    light = pair.light
    dark = pair.dark
  }

  const luminances = originalColors.map(getLuminance)
  const minLum = Math.min(...luminances)
  const maxLum = Math.max(...luminances)
  const range = maxLum - minLum || 1

  if (!preserveHierarchy || levels <= 2) {
    const midLum = (minLum + maxLum) / 2
    return originalColors.map((_, i) =>
      luminances[i] >= midLum ? light : dark
    )
  }

  const safeLevels = Math.min(levels, 8)
  const result: string[] = []

  originalColors.forEach((_, i) => {
    const normalized = (luminances[i] - minLum) / range
    const level = Math.min(safeLevels - 1, Math.floor(normalized * safeLevels))
    const t = level / (safeLevels - 1)
    result.push(lerpColor(dark, light, t))
  })

  return result
}

export function generateHalftonePattern(
  id: string,
  config: HalftoneConfig,
  duotoneLight: string,
  duotoneDark: string
): string {
  if (!config.enabled || config.type === 'none') return ''

  const { type, density, size, angle } = config
  const step = Math.max(2, Math.round(20 / density))

  let patternContent = ''

  switch (type) {
    case 'dot': {
      for (let y = 0; y < step * 3; y += step) {
        for (let x = 0; x < step * 3; x += step) {
          patternContent += `<circle cx="${x}" cy="${y}" r="${size * 0.4}" fill="${duotoneDark}"/>`
        }
      }
      break
    }
    case 'line': {
      for (let y = 0; y < step * 3; y += step) {
        patternContent += `<rect x="0" y="${y}" width="${step * 3}" height="${size * 0.3}" fill="${duotoneDark}"/>`
      }
      break
    }
    case 'circle': {
      for (let y = 0; y < step * 3; y += step) {
        for (let x = 0; x < step * 3; x += step) {
          patternContent += `<circle cx="${x}" cy="${y}" r="${size * 0.5}" fill="none" stroke="${duotoneDark}" stroke-width="${size * 0.15}"/>`
        }
      }
      break
    }
  }

  return `
  <pattern id="${id}" patternUnits="userSpaceOnUse" width="${step * 3}" height="${step * 3}" patternTransform="rotate(${angle})">
    <rect width="${step * 3}" height="${step * 3}" fill="${duotoneLight}"/>
    ${patternContent}
  </pattern>`
}

export function extractDuotoneFromPalette(
  colors: string[],
  preferDarkBg: boolean = false
): { light: string; dark: string; paperTone: string } {
  if (colors.length === 0) {
    return { light: '#FFFFFF', dark: '#000000', paperTone: '#FFFFFF' }
  }
  if (colors.length === 1) {
    const lum = getLuminance(colors[0])
    return lum > 128
      ? { light: colors[0], dark: '#000000', paperTone: colors[0] }
      : { light: '#FFFFFF', dark: colors[0], paperTone: '#FFFFFF' }
  }

  const withLum = colors.map((c, i) => ({ color: c, lum: getLuminance(c), idx: i }))
  withLum.sort((a, b) => a.lum - b.lum)

  const darkest = withLum[0]
  const lightest = withLum[withLum.length - 1]

  let bestDark = darkest.color
  let bestLight = lightest.color
  let bestScore = -1

  for (let i = 0; i < Math.min(3, withLum.length); i++) {
    for (let j = Math.max(0, withLum.length - 3); j < withLum.length; j++) {
      if (i === j) continue
      const dark = withLum[i].color
      const light = withLum[j].color
      const contrast = getContrastRatio(light, dark)
      const darkSat = colorSaturation(dark)
      const lightSat = colorSaturation(light)
      const hueDist = hueDistance(dark, light)
      const score = contrast * 2 + (darkSat + lightSat) * 0.5 + hueDist * 0.3
      if (score > bestScore) {
        bestScore = score
        bestDark = dark
        bestLight = light
      }
    }
  }

  const pair = ensureReadablePair(bestLight, bestDark)

  const bgCandidate = preferDarkBg ? pair.dark : pair.light
  const fgCandidate = preferDarkBg ? pair.light : pair.dark
  const paperTone = bgCandidate

  return {
    light: fgCandidate === pair.light ? pair.light : pair.dark,
    dark: fgCandidate === pair.dark ? pair.dark : pair.light,
    paperTone
  }
}

function colorSaturation(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return 0
  return (max - min) / max
}

function hueDistance(c1: string, c2: string): number {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  const h1 = rgbToHue(r1, g1, b1)
  const h2 = rgbToHue(r2, g2, b2)
  const diff = Math.abs(h1 - h2)
  return Math.min(diff, 360 - diff) / 180
}

function rgbToHue(r: number, g: number, b: number): number {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h = 0
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h = Math.round(h * 60)
  if (h < 0) h += 360
  return h
}

export function analyzePaletteReadability(
  colors: string[],
  bgColor: string
): { avgContrast: number; minContrast: number; passAA: boolean; passAAA: boolean } {
  if (colors.length === 0) {
    return { avgContrast: 0, minContrast: 0, passAA: false, passAAA: false }
  }

  const contrasts = colors.map(c => getContrastRatio(c, bgColor))
  const avgContrast = contrasts.reduce((a, b) => a + b, 0) / contrasts.length
  const minContrast = Math.min(...contrasts)

  return {
    avgContrast,
    minContrast,
    passAA: minContrast >= 4.5,
    passAAA: minContrast >= 7
  }
}
