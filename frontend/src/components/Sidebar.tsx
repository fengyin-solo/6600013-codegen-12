import { useDesignStore } from '../store/design'
import { THEMES } from '../themes/palettes'
import { DUOTONE_PALETTES } from '../utils/duotone'
import type { PatternType, HalftoneType } from '../types'

const PATTERNS: { value: PatternType; label: string }[] = [
  { value: 'spiral',  label: '🌀 螺旋' },
  { value: 'fractal', label: '🌳 分形树' },
  { value: 'wave',    label: '🌊 波浪' },
  { value: 'circles', label: '⭕ 圆环' },
  { value: 'voronoi', label: '🔷 泰森多边形' },
  { value: 'noise',   label: '🎲 噪声场' },
]

const HALFTONE_TYPES: { value: HalftoneType; label: string }[] = [
  { value: 'none',   label: '无' },
  { value: 'dot',    label: '网点' },
  { value: 'line',   label: '线网' },
  { value: 'circle', label: '圆环' },
]

export default function Sidebar() {
  const store = useDesignStore()

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto flex flex-col gap-4">
      <h2 className="text-lg font-bold">🎨 SVG 海报设计器</h2>

      {/* Pattern */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">图案类型</label>
        <div className="grid grid-cols-2 gap-2">
          {PATTERNS.map(p => (
            <button key={p.value} onClick={() => store.setPattern(p.value)}
              className={`px-2 py-1.5 rounded text-xs font-medium ${store.pattern===p.value?'bg-indigo-600':'bg-gray-700 hover:bg-gray-600'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">颜色主题</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => store.setTheme(t.id)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600">
              <div className="flex">{t.colors.map((c,i) => (
                <div key={i} style={{background:c}} className="w-3 h-3 rounded-full" />
              ))}</div>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duotone Poster Mode */}
      <div className="pt-2 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400 font-semibold">🖨️ 双色印刷海报模式</label>
          <button
            onClick={() => store.toggleDuotone()}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              store.duotoneEnabled ? 'bg-indigo-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                store.duotoneEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
              style={{ transform: store.duotoneEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        {store.duotoneEnabled && (
          <div className="space-y-3">
            {/* Auto Extract */}
            <button
              onClick={() => store.autoExtractDuotone()}
              className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 rounded text-xs font-medium flex items-center justify-center gap-1"
            >
              ✨ 从当前配色自动提取双色
            </button>

            {/* Duotone Presets */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">双色配色预设</label>
              <div className="grid grid-cols-2 gap-2">
                {DUOTONE_PALETTES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => store.setDuotonePalette(p.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      store.duotonePalette === p.id
                        ? 'bg-indigo-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex">
                      <div style={{ background: p.dark }} className="w-3 h-3 rounded-full" />
                      <div style={{ background: p.light }} className="w-3 h-3 rounded-full -ml-1" />
                    </div>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">自定义颜色</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="color"
                    value={store.duotoneDark}
                    onChange={e => store.setParam('duotoneDark', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">暗色</span>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="color"
                    value={store.duotoneLight}
                    onChange={e => store.setParam('duotoneLight', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">亮色</span>
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="color"
                    value={store.duotonePaperTone}
                    onChange={e => store.setParam('duotonePaperTone', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-400">纸色</span>
                </div>
              </div>
            </div>

            {/* Gray Levels */}
            <div>
              <label className="text-xs text-gray-400">灰阶层次: {store.duotoneGrayLevels}</label>
              <input type="range" min={2} max={8} step={1} value={store.duotoneGrayLevels}
                onChange={e => store.setParam('duotoneGrayLevels', Number(e.target.value))}
                className="w-full accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>2 (纯双色)</span>
                <span>8 (精细层次)</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={store.duotonePreserveHierarchy}
                  onChange={e => store.setParam('duotonePreserveHierarchy', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs">保留图案层次</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={store.duotoneEnhanceContrast}
                  onChange={e => store.setParam('duotoneEnhanceContrast', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs">增强对比度（调整描边）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={store.duotoneEnsureReadability}
                  onChange={e => store.setParam('duotoneEnsureReadability', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs">确保可读性（自动调对比度）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={store.duotoneShowColorChip}
                  onChange={e => store.setParam('duotoneShowColorChip', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs">显示印刷色标</span>
              </label>
            </div>

            {/* Halftone */}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400 font-semibold">半色调网点</label>
                <button
                  onClick={() => store.setParam('halftone', { ...store.halftone, enabled: !store.halftone.enabled })}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    store.halftone.enabled ? 'bg-indigo-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                    style={{ transform: store.halftone.enabled ? 'translateX(16px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              {store.halftone.enabled && (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">网点类型</label>
                    <div className="flex gap-1">
                      {HALFTONE_TYPES.map(ht => (
                        <button
                          key={ht.value}
                          onClick={() => store.setParam('halftone', { ...store.halftone, type: ht.value })}
                          className={`flex-1 px-1 py-1 rounded text-[10px] ${
                            store.halftone.type === ht.value ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {ht.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">密度: {store.halftone.density}</label>
                    <input type="range" min={2} max={20} step={1} value={store.halftone.density}
                      onChange={e => store.setParam('halftone', { ...store.halftone, density: Number(e.target.value) })}
                      className="w-full accent-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">网点大小: {store.halftone.size}</label>
                    <input type="range" min={1} max={8} step={0.5} value={store.halftone.size}
                      onChange={e => store.setParam('halftone', { ...store.halftone, size: Number(e.target.value) })}
                      className="w-full accent-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">角度: {store.halftone.angle}°</label>
                    <input type="range" min={0} max={90} step={5} value={store.halftone.angle}
                      onChange={e => store.setParam('halftone', { ...store.halftone, angle: Number(e.target.value) })}
                      className="w-full accent-purple-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Readability Indicator */}
            {store.duotoneReadability && (
              <div className="pt-2 border-t border-gray-700">
                <label className="text-xs text-gray-400 font-semibold block mb-1">📋 可读性检测</label>
                <div className="flex items-center gap-2 text-xs">
                  <span className={store.duotoneReadability.passAAA ? 'text-green-400' : store.duotoneReadability.passAA ? 'text-yellow-400' : 'text-red-400'}>
                    {store.duotoneReadability.passAAA ? '✅ AAA' : store.duotoneReadability.passAA ? '⚠️ AA' : '❌ 不达标'}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">最小对比: {store.duotoneReadability.minContrast.toFixed(1)}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">平均: {store.duotoneReadability.avgContrast.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seed */}
      <div>
        <label className="text-xs text-gray-400">种子: {store.seed}</label>
        <div className="flex gap-2 mt-1">
          <input type="range" min={0} max={99999} value={store.seed}
            onChange={e => store.setParam('seed', Number(e.target.value))} className="flex-1 accent-indigo-500" />
          <button onClick={() => store.randomSeed()} className="px-2 bg-indigo-600 rounded text-xs">🎲</button>
        </div>
      </div>

      {/* Iterations */}
      <div>
        <label className="text-xs text-gray-400">迭代数: {store.iterations}</label>
        <input type="range" min={10} max={500} step={10} value={store.iterations}
          onChange={e => store.setParam('iterations', Number(e.target.value))} className="w-full accent-purple-500" />
      </div>

      {/* Scale */}
      <div>
        <label className="text-xs text-gray-400">缩放: {store.scale.toFixed(2)}</label>
        <input type="range" min={0.1} max={3} step={0.1} value={store.scale}
          onChange={e => store.setParam('scale', Number(e.target.value))} className="w-full accent-green-500" />
      </div>

      {/* Rotation */}
      <div>
        <label className="text-xs text-gray-400">旋转: {store.rotation}°</label>
        <input type="range" min={0} max={360} step={5} value={store.rotation}
          onChange={e => store.setParam('rotation', Number(e.target.value))} className="w-full accent-yellow-500" />
      </div>

      {/* Stroke */}
      <div>
        <label className="text-xs text-gray-400">描边: {store.strokeWidth.toFixed(1)}</label>
        <input type="range" min={0.5} max={5} step={0.5} value={store.strokeWidth}
          onChange={e => store.setParam('strokeWidth', Number(e.target.value))} className="w-full accent-orange-500" />
      </div>

      {/* Opacity */}
      <div>
        <label className="text-xs text-gray-400">透明度: {store.opacity.toFixed(2)}</label>
        <input type="range" min={0.1} max={1} step={0.05} value={store.opacity}
          onChange={e => store.setParam('opacity', Number(e.target.value))} className="w-full accent-pink-500" />
      </div>

      {/* Export */}
      <div className="flex gap-2 mt-2">
        <button onClick={() => store.exportSvg()} className="flex-1 py-2 bg-teal-600 rounded text-sm font-medium">⬇ SVG</button>
        <button onClick={() => store.exportPng()} className="flex-1 py-2 bg-rose-600 rounded text-sm font-medium">⬇ PNG</button>
      </div>
    </div>
  )
}
