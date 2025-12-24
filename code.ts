const rgbToHsl = (r: number, g: number, b: number) => {
    const cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin
    let h = 0,
        s = 0,
        l = 0
    if (delta == 0) 
        h = 0
    else if (cmax == r)
        h = ((g - b) / delta) % 6
    else if (cmax == g)
        h = (b - r) / delta + 2
    else
        h = (r - g) / delta + 4
    h = Math.round(h * 60)
    if (h < 0)
        h += 360
    l = (cmax + cmin) / 2
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
    s = +(s * 100).toFixed(1)
    l = +(l * 100).toFixed(1)
    return {h, s, l}
}

const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100.0
    l /= 100.0
    const c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs((h / 60.0) % 2 - 1)),
    m = l - c/2.0
    let r = 0,
    g = 0,
    b = 0
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = r + m
    g = g + m
    b = b + m
    return {r, g, b}
} 

const wrap = (num: number, min: number, max: number) => {
    let newNum = num 
    if (newNum < min) newNum += max 
    if (newNum > max) newNum -= min
    return newNum
}

const mod = (num: number, mod: number) => {
    if (num === mod) return num 
    return num % mod
}

const clamp = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max)
}

const rotateColor = (color: RGB, hue: number, saturation: number, lightness: number) => {
    let {h, s, l} = rgbToHsl(color.r, color.g, color.b)

    h = mod(wrap(h + hue, 0, 360), 360)
    s = clamp(s + saturation, 0, 100)
    l = clamp(l + lightness, 0, 100)

    return hslToRgb(h, s, l)
}

const rgbToHex = (color: RGB | RGBA) => {
  const {r, g, b} = color
  const a = (color as RGBA).a ?? 1
  const hexPart = (part: number) => {
    return Math.round(part * 255).toString(16).padStart(2, "0")
  }
  return `#${hexPart(r) + hexPart(g) + hexPart(b) + (a < 1 ? hexPart(a) : "")}`
}

figma.showUI(__html__, {width: 300, height: 250, themeColors: true})

interface Message {
  type: string
  hue: number
  saturation: number
  lightness: number 
  select: string
  selectionItems: SelectionItems
  reset?: boolean
}

interface SelectionItems {
    variableEntries: {[key: string]: VariableEntry[]}
    styleEntries: {[key: string]: StyleEntry[]}
    fillEntries: {[key: string]: FillEntry[]}
    strokeEntries: {[key: string]: StrokeEntry[]}
    effectEntries: {[key: string]: EffectEntry[]}
}

interface VariableEntry {
  id: string
  mode: string
  color: RGBA
  name: string
  hexColor: string
  selected: boolean
}

interface StyleEntry {
  id: string
  style: PaintStyle
  index: number
  paint: SolidPaint
  name: string
  hexColor: string
  selected: boolean
}

type DrawNode = FrameNode | ComponentSetNode | ComponentNode | InstanceNode | SlideNode |
BooleanOperationNode | VectorNode | StarNode | LineNode | EllipseNode | PolygonNode | 
RectangleNode | TextNode | TextPathNode | StampNode | HighlightNode | WashiTapeNode

type FillNode = DrawNode | ShapeWithTextNode | StickyNode | SectionNode | TableNode
type StrokeNode = DrawNode | ShapeWithTextNode | ConnectorNode
type EffectNode = DrawNode | TransformGroupNode | GroupNode
type ColorEffect = DropShadowEffect | InnerShadowEffect | NoiseEffect

interface FillEntry {
  id: string
  node: FillNode
  index: number
  paint: SolidPaint
  name: string
  hexColor: string
  selected: boolean
}

interface StrokeEntry {
  id: string
  node: StrokeNode
  index: number
  paint: SolidPaint
  name: string
  hexColor: string
  selected: boolean
}

interface EffectEntry {
  id: string
  node: EffectNode
  index: number
  effect: ColorEffect
  name: string
  hexColor: string
  selected: boolean
}

const variableMap = new Map<string, VariableEntry[]>()
const styleMap = new Map<string, StyleEntry[]>()
const fillMap = new Map<string, FillEntry[]>()
const strokeMap = new Map<string, StrokeEntry[]>()
const effectMap = new Map<string, EffectEntry[]>()

const getFillEntries = (node: FillNode) => {
    if (node.fills === figma.mixed) return []
    const entries = [] as FillEntry[]
    for (let i = 0; i < node.fills.length; i++) {
      const paint = node.fills[i]
      if (paint.type === "SOLID") {
        if (Object.keys(paint.boundVariables ?? {}).length) continue
        const hexColor = rgbToHex(paint.color)
        entries.push({id: node.id, index: i, node, paint, name: hexColor, hexColor, selected: true})
      }
    }
    return entries
}

const appendFillEntries = (node: FillNode) => {
  const entries = getFillEntries(node)
  if (entries.length) fillMap.set(node.id, entries)
}

const getStrokeEntries = (node: StrokeNode) => {
    const entries = [] as StrokeEntry[]
    for (let i = 0; i < node.strokes.length; i++) {
      const paint = node.strokes[i]
      if (paint.type === "SOLID") {
        if (Object.keys(paint.boundVariables ?? {}).length) continue
        const hexColor = rgbToHex(paint.color)
        entries.push({id: node.id, index: i, node, paint, name: hexColor, hexColor, selected: true})
      }
    }
    return entries
}

const appendStrokeEntries = (node: StrokeNode) => {
  const entries = getStrokeEntries(node)
  if (entries.length) strokeMap.set(node.id, entries)
}

const getEffectEntries = (node: EffectNode) => {
    const entries = [] as EffectEntry[]
    for (let i = 0; i < node.effects.length; i++) {
      const effect = node.effects[i]
      if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW" 
        || effect.type === "NOISE") {
        if (Object.keys(effect.boundVariables ?? {}).length) continue
        const hexColor = rgbToHex(effect.color)
        entries.push({id: `${node.id}-${i}`, index: i, node, effect, name: hexColor, hexColor, selected: true})
      }
    }
    return entries
}

const appendEffectEntries = (node: EffectNode) => {
  const entries = getEffectEntries(node)
  if (entries.length) effectMap.set(node.id, entries)
}

figma.on("run", async () => {
  const savedSelect = await figma.clientStorage.getAsync("select")
  figma.ui.postMessage({type: "init-values", select: savedSelect})
  
    const variables = await figma.variables.getLocalVariablesAsync("COLOR")
    for (const variable of variables) {
      const entries = [] as VariableEntry[]
      for (const [mode, value] of Object.entries(variable.valuesByMode)) {
        if ((value as VariableAlias).type === "VARIABLE_ALIAS") continue
        const color = value as RGBA
        const hexColor = rgbToHex(color)
        entries.push({id: variable.id, mode, color, name: variable.name, hexColor, selected: true})
      }
      if (entries.length) variableMap.set(variable.id, entries)
    }

    const styles = await figma.getLocalPaintStylesAsync()
    for (const style of styles) {
      const entries = [] as StyleEntry[]
      for (let i = 0; i < style.paints.length; i++) {
        const paint = style.paints[i]
        if (paint.type === "SOLID") {
          if (Object.keys(paint.boundVariables ?? {}).length) continue
          const hexColor = rgbToHex(paint.color)
          entries.push({id: style.id, index: i, style, paint, name: style.name, hexColor, selected: true})
        }
      }
      if (entries.length) styleMap.set(style.id, entries)
    }

    figma.currentPage.findAll((node) => {
      if ("fills" in node) {
        appendFillEntries(node)
      }
      if ("strokes" in node) {
        appendStrokeEntries(node)
      }
      if ("effects" in node) {
        appendEffectEntries(node)
      }

      return false
    })
})

figma.on("selectionchange", async () => {
    const selectionItems = await resolveSelection()
    figma.ui.postMessage({type: "selection-change", selectionItems})
})

const resolveVariables = async (variableID: string, visited = new Set<string>(), 
  collected = new Map<string, Variable>()) => {
  if (visited.has(variableID)) return []
  visited.add(variableID)

  const variable = await figma.variables.getVariableByIdAsync(variableID)
  if (!variable) return []

  collected.set(variable.id, variable)

  for (const [_, value] of Object.entries(variable.valuesByMode)) {
    if ((value as VariableAlias).type === "VARIABLE_ALIAS") {
      await resolveVariables((value as VariableAlias).id, visited, collected)
    }
  }
  return [...collected.values()]
}

const resolveSelection = async () => {
  const nodes = figma.currentPage.selection
  const variableEntries = Object.create(null) as {[key: string]: VariableEntry[]}
  const styleEntries = Object.create(null) as {[key: string]: StyleEntry[]}
  const fillEntries = Object.create(null) as {[key: string]: FillEntry[]}
  const strokeEntries = Object.create(null) as {[key: string]: StrokeEntry[]}
  const effectEntries = Object.create(null) as {[key: string]: EffectEntry[]}
  
  const selectedColors = figma.getSelectionColors()
  if (selectedColors) {
    for (const paint of selectedColors.paints) {
      if (paint.type === "SOLID") {
        if (paint.boundVariables?.color?.type === "VARIABLE_ALIAS") {
          const variables = await resolveVariables(paint.boundVariables.color.id)
          for (const variable of variables) {
            const entries = [] as VariableEntry[]
            for (const [mode, value] of Object.entries(variable.valuesByMode)) {
              if ((value as VariableAlias).type === "VARIABLE_ALIAS") continue
              const color = value as RGBA
              const hexColor = rgbToHex(color)
              const activeModes = Object.values(figma.currentPage.explicitVariableModes)
              if (!activeModes.length || activeModes.includes(mode)) {
                entries.push({id: variable.id, mode, color, name: variable.name, hexColor, selected: true})
              }
            }
            if (entries.length) variableEntries[variable.id] = entries
          }
        }
      }
    }
    for (const style of selectedColors.styles) {
      const entries = [] as StyleEntry[]
      for (let i = 0; i < style.paints.length; i++) {
        const paint = style.paints[i]
        if (paint.type === "SOLID") {
          if (Object.keys(paint.boundVariables ?? {}).length) continue
          const hexColor = rgbToHex(paint.color)
          entries.push({id: style.id, index: i, style, paint, name: style.name, hexColor, selected: true})
        }
      }
      if (entries.length) styleEntries[style.id] = entries
    }
  }

  for (const node of nodes) {
    if ("fills" in node) {
      const entries = getFillEntries(node)
      if (entries.length) fillEntries[node.id] = entries
    }
    if ("strokes" in node) {
      const entries = getStrokeEntries(node)
      if (entries.length) strokeEntries[node.id] = entries
    }
    if ("effects" in node) {
      const entries = getEffectEntries(node)
      if (entries.length) effectEntries[node.id] = entries
    }
  }

  return {variableEntries, styleEntries, fillEntries, strokeEntries, effectEntries} as SelectionItems
}

figma.ui.onmessage = async (msg: Message) => {
  if (msg.type === "update") {
    let localVariableMap = variableMap
    let localStyleMap = styleMap
    let localFillMap = fillMap
    let localStrokeMap = strokeMap
    let localEffectMap = effectMap

    if (msg.select === "select") {
      const {variableEntries, styleEntries, fillEntries, strokeEntries, effectEntries} = msg.selectionItems

      localVariableMap = new Map()
      for (const [variableID, entries] of variableMap.entries()) {
        const uiEntries = variableEntries[variableID]
        if (uiEntries) {
          const filtered = entries.filter(e => uiEntries.some(u => e.id === u.id && u.selected))
          localVariableMap.set(variableID, filtered)
        }
      }
      localStyleMap = new Map()
      for (const [styleID, entries] of styleMap.entries()) {
        const uiEntries = styleEntries[styleID]
        if (uiEntries) {
          const filtered = entries.filter(e => uiEntries.some(u => e.id === u.id && u.selected))
          localStyleMap.set(styleID, filtered)
        }
      }
      localFillMap = new Map()
      for (const [nodeID, entries] of fillMap.entries()) {
        const uiEntries = fillEntries[nodeID]
        if (uiEntries) {
          const filtered = entries.filter(e => uiEntries.some(u => e.id === u.id && u.selected))
          localFillMap.set(nodeID, filtered)
        }
      }

      localStrokeMap = new Map()
      for (const [nodeID, entries] of strokeMap.entries()) {
        const uiEntries = strokeEntries[nodeID]
        if (uiEntries) {
          const filtered = entries.filter(e => uiEntries.some(u => e.id === u.id && u.selected))
          localStrokeMap.set(nodeID, filtered)
        }
      }

      localEffectMap = new Map()
      for (const [nodeID, entries] of effectMap.entries()) {
        const uiEntries = effectEntries[nodeID]
        if (uiEntries) {
          const filtered = entries.filter(e => uiEntries.some(u => e.id === u.id && u.selected))
          localEffectMap.set(nodeID, filtered)
        }
      }
    }

    for (const [variableID, entries] of localVariableMap.entries()) {
      const variable = await figma.variables.getVariableByIdAsync(variableID)
      if (!variable) continue
      for (const entry of entries) {
        const activeModes = Object.values(figma.currentPage.explicitVariableModes)
        if (!activeModes.length || activeModes.includes(entry.mode)) {
          const rotated = rotateColor(entry.color, msg.hue, msg.saturation, msg.lightness)
          variable.setValueForMode(entry.mode, {...rotated, a: entry.color.a ?? 1})
        }
      }
    }

    for (const [_, entries] of localStyleMap.entries()) {
      for (const entry of entries) {
        const paints = entry.style.paints.slice()
        for (let i = 0; i < paints.length; i++) {
          if (entry.index === i) {
            const rotated = rotateColor(entry.paint.color, msg.hue, msg.saturation, msg.lightness)
            paints[i] = figma.util.solidPaint(rotated, entry.paint)
          }
        }
        entry.style.paints = paints
      }
    }

    for (const [_, entries] of localFillMap.entries()) {
      for (const entry of entries) {
        if (entry.node.fills === figma.mixed) continue
        const paints = entry.node.fills.slice()
        for (let i = 0; i < paints.length; i++) {
          if (entry.index === i) {
            const rotated = rotateColor(entry.paint.color, msg.hue, msg.saturation, msg.lightness)
            paints[i] = figma.util.solidPaint(rotated, entry.paint)
          }
        }
        entry.node.fills = paints
      }
    }

    for (const [_, entries] of localStrokeMap.entries()) {
      for (const entry of entries) {
        const paints = entry.node.strokes.slice()
        for (let i = 0; i < paints.length; i++) {
          if (entry.index === i) {
            const rotated = rotateColor(entry.paint.color, msg.hue, msg.saturation, msg.lightness)
            paints[i] = figma.util.solidPaint(rotated, entry.paint)
          }
        }
        entry.node.strokes = paints
      }
    }

    for (const [_, entries] of localEffectMap.entries()) {
      for (const entry of entries) {
        const effects = entry.node.effects.slice()
        for (let i = 0; i < effects.length; i++) {
          if (entry.index === i) {
            if (effects[i].type === "DROP_SHADOW" || effects[i].type === "INNER_SHADOW"
              || effects[i].type === "NOISE") {
              const rotated = rotateColor(entry.effect.color, msg.hue, msg.saturation, msg.lightness)
              // @ts-expect-error it's a color effect
              effects[i] = {...effects[i], color: {...rotated, a: entry.effect.color.a ?? 1}}
            }
          }
        }
        entry.node.effects = effects
      }
    }
  }

  if (msg.type === "save-values") {
    await figma.clientStorage.setAsync("select", msg.select)
    const selectionItems = await resolveSelection()
    figma.ui.postMessage({type: "selection-change", selectionItems})
  }

  if (msg.type === "cancel") {
    figma.closePlugin()
    figma.triggerUndo()
  }

  if (msg.type === "apply") {
    figma.closePlugin()
  }
}