import { useEffect, useRef } from 'react'
import { useDesignStore } from '../store/design'
import { createRng, generateSpiral, generateFractal, generateWave, generateCircles, generateVoronoi, generateNoise } from '../generators/patterns'
import { convertToDuotoneAdvanced, getDuotoneModifier, generateHalftonePattern, analyzePaletteReadability } from '../utils/duotone'

export default function ArtCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const store = useDesignStore()

  useEffect(() => {
    const rng = createRng(store.seed)
    const {
      width, height, pattern, iterations, scale, palette, strokeWidth, opacity,
      bgColor, rotation, duotoneEnabled, duotoneLight, duotoneDark,
      duotonePreserveHierarchy, duotoneEnhanceContrast, duotoneGrayLevels,
      duotoneEnsureReadability, duotoneShowColorChip, duotonePaperTone, halftone
    } = store

    const originalPalette = [...palette]
    let effectivePalette = palette
    let effectiveBgColor = bgColor

    if (duotoneEnabled) {
      effectivePalette = convertToDuotoneAdvanced(originalPalette, duotoneLight, duotoneDark, {
        preserveHierarchy: duotonePreserveHierarchy,
        levels: duotoneGrayLevels,
        ensureContrast: duotoneEnsureReadability
      })
      effectiveBgColor = duotonePaperTone || duotoneLight

      const readability = analyzePaletteReadability(effectivePalette, effectiveBgColor)
      store.setParam('duotoneReadability' as any, readability)
    }

    let content = ''
    switch (pattern) {
      case 'spiral':  content = generateSpiral(width, height, iterations, scale, effectivePalette, rng, strokeWidth, opacity); break
      case 'fractal': content = generateFractal(width, height, iterations, scale, effectivePalette, rng, strokeWidth, opacity); break
      case 'wave':    content = generateWave(width, height, iterations, scale, effectivePalette, rng, strokeWidth, opacity); break
      case 'circles': content = generateCircles(width, height, iterations, scale, effectivePalette, rng, strokeWidth, opacity); break
      case 'voronoi': content = generateVoronoi(width, height, iterations, scale, effectivePalette, rng, strokeWidth, opacity); break
      case 'noise':   content = generateNoise(width, height, iterations, scale, effectivePalette, rng, strokeWidth, opacity); break
    }

    let finalContent = content
    if (duotoneEnabled && duotoneEnhanceContrast) {
      const colorMap = new Map<string, { strokeMultiplier: number; opacityMultiplier: number }>()
      originalPalette.forEach((color, i) => {
        const effectiveColor = effectivePalette[i]
        const modifier = getDuotoneModifier(color, duotoneLight, duotoneDark)
        colorMap.set(effectiveColor.toUpperCase(), modifier)
        colorMap.set(effectiveColor.toLowerCase(), modifier)
      })

      finalContent = content.replace(
        /stroke="(#[0-9a-fA-F]{6})"([^>]*?)stroke-width="([^"]+)"([^>]*?)opacity="([^"]+)"/g,
        (match, color, between1, sw, between2, op) => {
          const modifier = colorMap.get(color)
          if (modifier) {
            const newSw = (parseFloat(sw) * modifier.strokeMultiplier).toFixed(2)
            const newOp = Math.min(1, parseFloat(op) * modifier.opacityMultiplier).toFixed(2)
            return `stroke="${color}"${between1}stroke-width="${newSw}"${between2}opacity="${newOp}"`
          }
          return match
        }
      )
    }

    let defs = ''
    let halftoneOverlay = ''
    if (duotoneEnabled && halftone.enabled && halftone.type !== 'none') {
      const halftoneId = 'halftone-pattern'
      defs = `<defs>${generateHalftonePattern(halftoneId, halftone, duotoneLight, duotoneDark)}</defs>`
      halftoneOverlay = `<rect width="${width}" height="${height}" fill="url(#${halftoneId})" opacity="0.15"/>`
    }

    let colorChipSvg = ''
    if (duotoneEnabled && duotoneShowColorChip) {
      const chipX = width - 120
      const chipY = height - 80
      const uniqueColors = [...new Set(effectivePalette)]
      const chipW = 100
      const chipH = 60
      const swatchW = Math.min(20, chipW / uniqueColors.length)
      colorChipSvg = `
<g transform="translate(${chipX},${chipY})">
  <rect width="${chipW}" height="${chipH}" rx="4" fill="${effectiveBgColor}" stroke="${duotoneDark}" stroke-width="1" opacity="0.9"/>
  <text x="${chipW/2}" y="14" text-anchor="middle" font-size="8" fill="${duotoneDark}" font-family="monospace">DUOTONE</text>
  <text x="${chipW/2}" y="24" text-anchor="middle" font-size="6" fill="${duotoneDark}" font-family="monospace">${duotoneDark.toUpperCase()} + ${duotoneLight.toUpperCase()}</text>
  ${uniqueColors.map((c, i) => `<rect x="${8 + i * (swatchW + 2)}" y="${32}" width="${swatchW}" height="12" rx="1" fill="${c}" stroke="${duotoneDark}" stroke-width="0.5"/>`).join('')}
  <rect x="8" y="48" width="16" height="8" rx="1" fill="${duotoneDark}"/>
  <rect x="28" y="48" width="16" height="8" rx="1" fill="${duotoneLight}"/>
  <text x="48" y="55" font-size="6" fill="${duotoneDark}" font-family="monospace">${uniqueColors.length}色阶</text>
</g>`
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${defs}
  <rect width="${width}" height="${height}" fill="${effectiveBgColor}"/>
  <g transform="rotate(${rotation},${width/2},${height/2})">${finalContent}</g>
  ${halftoneOverlay}
  ${colorChipSvg}
</svg>`
    store.setSvgContent(svg)
    if (containerRef.current) {
      containerRef.current.innerHTML = svg
    }
  }, [store.pattern, store.seed, store.iterations, store.scale, store.rotation,
      store.strokeWidth, store.opacity, store.bgColor, store.palette, store.width, store.height,
      store.duotoneEnabled, store.duotoneLight, store.duotoneDark,
      store.duotonePreserveHierarchy, store.duotoneEnhanceContrast,
      store.duotoneGrayLevels, store.duotoneEnsureReadability,
      store.duotoneShowColorChip, store.duotonePaperTone,
      store.halftone])

  return (
    <div
      ref={containerRef}
      className="shadow-2xl rounded border border-gray-700"
      style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'hidden' }}
    />
  )
}
