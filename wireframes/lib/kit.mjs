// Tiny SVG drawing kit for the Libris high-fidelity wireframes.
// Everything is plain SVG text/shapes so the files stay editable in Figma.

export const C = {
  bg: '#FAF7F1',
  white: '#FFFFFF',
  cream50: '#FDFCF9',
  cream100: '#FAF7F1',
  cream200: '#F3EDE2',
  cream300: '#E8DECB',
  cream400: '#D8C8AC',
  cream500: '#C4AE8C',
  ink: '#1C1917',
  inkSoft: '#44403C',
  inkMuted: '#57534E',
  inkFaint: '#78716C',
  forest50: '#F1F7F2',
  forest100: '#DFEDE2',
  forest200: '#C0DBC7',
  forest300: '#94C1A1',
  forest400: '#61A177',
  forest500: '#3F845A',
  forest600: '#2E6A47',
  forest700: '#26553A',
  forest800: '#204531',
  forest900: '#1B3A2A',
  forest950: '#0D2118',
  brass50: '#FCF8EC',
  brass100: '#F7EDCB',
  brass200: '#EFD997',
  brass300: '#E4BF5C',
  brass400: '#D9A83A',
  brass500: '#C98C25',
  brass600: '#AE6D1C',
  brass700: '#8B5118',
  brass800: '#734218',
  brass900: '#613819',
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',
  sky50: '#F0F9FF',
  sky100: '#E0F2FE',
  sky200: '#BAE6FD',
  sky700: '#0369A1',
  violet50: '#F5F3FF',
  violet100: '#EDE9FE',
  violet700: '#6D28D9',
  teal700: '#0F766E',
  amber700: '#B45309',
  stone100: '#F5F5F4',
  stone200: '#E7E5E4',
  stone400: '#A8A29E',
  stone500: '#78716C',
  stone700: '#44403C',
  stone800: '#292524',
  stone900: '#1C1917',
  slate700: '#334155',
  slate900: '#0F172A',
}

export const SANS = "'Inter', 'Segoe UI', Arial, sans-serif"
export const DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif"

export const W = 1440
export const H = 900
export const SIDEBAR = 256
export const MAIN_X = 288
export const MAIN_W = 1120

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function attrs(options) {
  return Object.entries(options)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}

export function rect(x, y, w, h, options = {}) {
  const { fill = C.white, stroke, rx = 0, sw = 1, opacity, dash } = options
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs({
    rx,
    fill,
    stroke,
    'stroke-width': stroke ? sw : undefined,
    opacity,
    'stroke-dasharray': dash,
  })}/>`
}

export function circle(cx, cy, r, options = {}) {
  const { fill = 'none', stroke, sw = 1, opacity } = options
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrs({
    fill,
    stroke,
    'stroke-width': stroke ? sw : undefined,
    opacity,
  })}/>`
}

export function line(x1, y1, x2, y2, options = {}) {
  const { stroke = C.cream300, sw = 1, opacity, dash } = options
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs({
    stroke,
    'stroke-width': sw,
    opacity,
    'stroke-dasharray': dash,
  })}/>`
}

export function path(d, options = {}) {
  const {
    fill = 'none',
    stroke,
    sw = 1.6,
    linecap = 'round',
    linejoin = 'round',
    opacity,
  } = options
  return `<path d="${d}" ${attrs({
    fill,
    stroke,
    'stroke-width': stroke ? sw : undefined,
    'stroke-linecap': linecap,
    'stroke-linejoin': linejoin,
    opacity,
  })}/>`
}

export function text(x, y, value, options = {}) {
  const {
    size = 14,
    weight = 400,
    fill = C.ink,
    family = SANS,
    anchor = 'start',
    letter,
    opacity,
    italic,
  } = options
  return `<text x="${x}" y="${y}" ${attrs({
    'font-family': family,
    'font-size': size,
    'font-weight': weight,
    fill,
    'text-anchor': anchor,
    'letter-spacing': letter,
    opacity,
    'font-style': italic ? 'italic' : undefined,
  })}>${esc(value)}</text>`
}

export function wrap(x, y, value, maxChars, lh, options = {}) {
  const words = String(value).split(/\s+/)
  const rows = []
  let current = ''
  for (const word of words) {
    if (current && (current + ' ' + word).length > maxChars) {
      rows.push(current)
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) rows.push(current)
  return rows.map((row, index) => text(x, y + index * lh, row, options)).join('')
}

// ---------------------------------------------------------------- icons

const ICONS = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/>',
  bookopen:
    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  library:
    '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01"/><path d="M15 10h.01"/>',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>',
  user:
    '<circle cx="12" cy="8" r="4.2"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  shield:
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  arrowright: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowleft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  arrowup: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  checkcircle: '<circle cx="12" cy="12" r="9.5"/><path d="m8 12 3 3 5-6"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/>',
  alert:
    '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  mail:
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  mailcheck:
    '<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="m22 7-10 6L2 7"/><path d="m16 19 2 2 4-4"/>',
  lock:
    '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  pencil:
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  dollar:
    '<circle cx="12" cy="12" r="9.5"/><path d="M12 6v12"/><path d="M15 9.5A2.5 2.5 0 0 0 12.5 7h-1a2.5 2.5 0 0 0 0 5h1a2.5 2.5 0 0 1 0 5h-1A2.5 2.5 0 0 1 9 14.5"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  filter:
    '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/>',
  bookmark:
    '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  rotate:
    '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  key: '<circle cx="7.5" cy="15.5" r="5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3"/>',
  save:
    '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  eye:
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  copy:
    '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  sparkle:
    '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  handcoins:
    '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 2.5-2.5"/><path d="M18 12h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-9"/><circle cx="16" cy="6" r="3"/><path d="M16 9v1"/>',
  compas:
    '<circle cx="12" cy="12" r="9.5"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/>',
}

export function icon(name, x, y, size = 18, color = C.ink, sw = 1.8) {
  const body = ICONS[name] || ICONS.bookopen
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`
}

// ---------------------------------------------------------------- atoms

const TONES = {
  success: { bg: C.forest50, fg: C.forest700, ring: C.forest200 },
  warning: { bg: C.brass50, fg: C.brass800, ring: C.brass200 },
  danger: { bg: C.red50, fg: C.red700, ring: C.red200 },
  neutral: { bg: C.cream100, fg: C.inkMuted, ring: C.cream300 },
  info: { bg: C.sky50, fg: C.sky700, ring: C.sky200 },
  forest: { bg: C.forest800, fg: C.cream50, ring: C.forest800 },
  brass: { bg: C.brass600, fg: C.white, ring: C.brass600 },
  violet: { bg: C.violet50, fg: C.violet700, ring: C.violet100 },
}

export function toneOf(value) {
  const v = String(value || '').toLowerCase()
  if (['available', 'paid', 'returned', 'verified', 'active', 'on loan'].includes(v)) return 'success'
  if (['borrowed', 'unpaid', 'overdue', 'damaged', 'pending', 'warning'].includes(v)) return 'warning'
  if (['lost', 'declined', 'rejected', 'cancelled'].includes(v)) return 'danger'
  return 'neutral'
}

export function badgeWidth(label) {
  return Math.max(46, Math.round(label.length * 6.05 + 18))
}

export function badge(x, y, label, options = {}) {
  const { tone = 'neutral', anchor = 'start', h = 22 } = options
  const colors = TONES[tone] || TONES.neutral
  const w = badgeWidth(label)
  const left = anchor === 'end' ? x - w : anchor === 'center' ? x - w / 2 : x
  return `${rect(left, y, w, h, {
    fill: colors.bg,
    stroke: colors.ring,
    rx: h / 2,
  })}${text(left + w / 2, y + h / 2 + 4, label, {
    size: 11,
    weight: 600,
    fill: colors.fg,
    anchor: 'middle',
  })}`
}

export function button(x, y, label, options = {}) {
  const {
    variant = 'primary',
    iconName,
    w,
    h = 40,
    size = 13.5,
    disabled = false,
  } = options
  const iconSlot = iconName ? 24 : 0
  const width = w || Math.max(96, Math.round(label.length * (size * 0.56) + 34 + iconSlot))
  const styles = {
    primary: { fill: C.forest800, stroke: 'none', fg: C.cream50, icon: C.cream50 },
    secondary: { fill: C.white, stroke: C.cream300, fg: C.inkSoft, icon: C.inkMuted },
    ghost: { fill: 'none', stroke: 'none', fg: C.inkMuted, icon: C.inkMuted },
    danger: { fill: C.red700, stroke: 'none', fg: C.white, icon: C.white },
    brass: { fill: C.brass600, stroke: 'none', fg: C.white, icon: C.white },
  }
  const style = styles[variant] || styles.primary
  const contentW = label.length * size * 0.56 + (iconName ? 24 : 0)
  const start = x + (width - contentW) / 2
  const baseline = y + h / 2 + size * 0.36
  return `${rect(x, y, width, h, {
    fill: style.fill,
    stroke: style.stroke === 'none' ? undefined : style.stroke,
    rx: 10,
    opacity: disabled ? 0.5 : undefined,
  })}${
    iconName ? icon(iconName, start, y + h / 2 - 8, 16, style.icon) : ''
  }${text(start + (iconName ? 24 : 0), baseline, label, {
    size,
    weight: 600,
    fill: style.fg,
  })}`
}

export function searchField(x, y, w, options = {}) {
  const { placeholder = 'Search…', h = 40 } = options
  return `${rect(x, y, w, h, { fill: C.white, stroke: C.cream300, rx: 10 })}${icon(
    'search',
    x + 12,
    y + h / 2 - 8,
    16,
    C.inkFaint,
  )}${text(x + 36, y + h / 2 + 5, placeholder, { size: 13, fill: C.inkFaint })}`
}

export function textField(x, y, w, options = {}) {
  const {
    label,
    value = '',
    placeholder = '',
    h = 42,
    focus = false,
    hint,
    error,
    iconName,
    type = 'text',
  } = options
  let out = ''
  if (label) {
    out += text(x, y, label, { size: 12.5, weight: 600, fill: C.inkSoft })
  }
  const top = label ? y + 10 : y
  out += rect(x, top, w, h, {
    fill: C.white,
    stroke: error ? C.red500 : focus ? C.forest500 : C.cream300,
    rx: 10,
    sw: focus ? 2 : 1,
  })
  const textX = x + (iconName ? 38 : 14)
  if (iconName) out += icon(iconName, x + 13, top + h / 2 - 8, 16, C.inkFaint)
  out += text(textX, top + h / 2 + 5, value || placeholder, {
    size: 13,
    fill: value ? C.ink : C.inkFaint,
  })
  if (hint) out += text(x, top + h + 18, hint, { size: 11, fill: C.inkFaint })
  if (error) out += text(x, top + h + 18, error, { size: 11, fill: C.red600 })
  return out
}

export function selectField(x, y, w, options = {}) {
  const { label, value = '', h = 42 } = options
  let out = ''
  if (label) out += text(x, y, label, { size: 12.5, weight: 600, fill: C.inkSoft })
  const top = label ? y + 10 : y
  out += rect(x, top, w, h, { fill: C.white, stroke: C.cream300, rx: 10 })
  out += text(x + 14, top + h / 2 + 5, value, { size: 13, fill: C.ink })
  out += icon('chevron', x + w - 30, top + h / 2 - 8, 16, C.inkFaint)
  return out
}

export function tabs(x, y, items, options = {}) {
  const { active = 0, gap = 28 } = options
  let out = ''
  let offset = 0
  items.forEach((item, index) => {
    const label = typeof item === 'string' ? item : item.label
    const count = typeof item === 'string' ? null : item.count
    const isActive = index === active
    const start = x + offset
    const labelW = label.length * 7 + 12
    out += text(start, y, label, {
      size: 13,
      weight: isActive ? 600 : 500,
      fill: isActive ? C.forest800 : C.inkMuted,
    })
    if (isActive) out += rect(start, y + 12, labelW, 2, { fill: C.forest700, rx: 1 })
    offset += labelW + 8
    if (count !== undefined) {
      out += badge(start + offset - x, y - 15, String(count), {
        tone: isActive ? 'success' : 'neutral',
        h: 20,
      })
      offset += badgeWidth(String(count)) + 6
    }
    offset += gap
  })
  return out
}

export function avatar(x, y, size, options = {}) {
  const { initials = 'JD', role = 'student' } = options
  const styles = {
    student: { bg: C.forest100, fg: C.forest800 },
    librarian: { bg: C.brass100, fg: C.brass900 },
    super: { bg: C.forest800, fg: C.brass200 },
    staff: { bg: C.brass100, fg: C.brass900 },
  }
  const style = styles[role] || styles.student
  return `${circle(x + size / 2, y + size / 2, size / 2, { fill: style.bg })}${text(
    x + size / 2,
    y + size / 2 + size * 0.19,
    initials,
    { size: size * 0.36, weight: 700, fill: style.fg, anchor: 'middle' },
  )}`
}

// ---------------------------------------------------------------- cards

export function card(x, y, w, h, options = {}) {
  const { fill = C.white, stroke = C.cream300, rx = 16 } = options
  return rect(x, y, w, h, { fill, stroke, rx })
}

export function statCard(x, y, w, options = {}) {
  const { label, value, hint, iconName, tone = 'forest', h = 126 } = options
  const tones = {
    forest: [C.forest50, C.forest700, C.forest100],
    brass: [C.brass50, C.brass700, C.brass100],
    red: [C.red50, C.red600, C.red100],
    cream: [C.cream100, C.inkSoft, C.cream200],
  }
  const [bg, fg, ring] = tones[tone] || tones.forest
  return `${card(x, y, w, h)}${text(x + 20, y + 26, label.toUpperCase(), {
    size: 10,
    weight: 700,
    fill: C.inkFaint,
    letter: 1.2,
  })}${text(x + 20, y + 66, value, {
    size: 32,
    weight: 600,
    family: DISPLAY,
    fill: C.ink,
  })}${
    hint ? wrap(x + 20, y + 90, hint, Math.floor((w - 90) / 6), 15, { size: 11.5, fill: C.inkMuted }) : ''
  }${
    iconName
      ? `${rect(x + w - 64, y + 20, 44, 44, { fill: bg, rx: 12 })}${icon(
          iconName,
          x + w - 54,
          y + 30,
          24,
          fg,
        )}${rect(x + w - 64, y + 20, 44, 44, { fill: 'none', stroke: ring, rx: 12 })}`
      : ''
  }`
}

export function pageHeader(x, y, w, options = {}) {
  const { eyebrow, title, description, actions = [] } = options
  let out = ''
  if (eyebrow) {
    out += text(x, y + 8, eyebrow.toUpperCase(), {
      size: 10.5,
      weight: 700,
      fill: C.forest700,
      letter: 1.7,
    })
  }
  out += text(x, y + 40, title, { size: 30, weight: 600, family: DISPLAY, fill: C.ink })
  if (description) {
    out += wrap(x, y + 63, description, Math.floor((w - 320) / 6.8), 17, {
      size: 13,
      fill: C.inkMuted,
    })
  }
  let offset = 0
  actions.forEach((action) => {
    const width = action.w || Math.max(96, Math.round(action.label.length * 7 + 40))
    out += button(x + w - width - offset, y + 6, action.label, {
      variant: action.variant,
      iconName: action.iconName,
      w: width,
    })
    offset += width + 10
  })
  return out
}

export function sectionTitle(x, y, title, options = {}) {
  const { hint, action } = options
  let out = text(x, y, title, { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
  if (hint) out += text(x, y + 19, hint, { size: 11.5, fill: C.inkFaint })
  if (action) out += text(x + action.width, y, action.label, { size: 12, weight: 600, fill: C.forest700, anchor: 'end' })
  return out
}

export function emptyState(x, y, w, options = {}) {
  const { iconName = 'inbox', title = 'Nothing here yet', body = '', action } = options
  let out = circle(x + w / 2, y + 34, 27, { fill: C.cream100, stroke: C.cream200 })
  out += icon(iconName, x + w / 2 - 12, y + 22, 24, C.inkFaint)
  out += text(x + w / 2, y + 86, title, { size: 16, weight: 600, family: DISPLAY, anchor: 'middle', fill: C.ink })
  if (body) out += wrap(x + w / 2 - Math.min(220, w / 2), y + 108, body, Math.floor(Math.min(440, w) / 6.4), 17, { size: 12.5, fill: C.inkMuted, anchor: 'start' })
  if (action) out += button(x + w / 2 - 70, y + 142, action, { variant: 'primary' })
  return out
}

export function bookCover(x, y, w, options = {}) {
  const { title = 'Untitled', category = 'Fiction', h = 140, author } = options
  const palettes = {
    Fiction: [C.forest700, C.forest950],
    Literature: [C.brass600, C.brass900],
    History: [C.stone500, C.stone900],
    Science: [C.teal700, C.forest950],
    Technology: [C.sky700, C.slate900],
    Psychology: [C.violet700, C.stone900],
    Philosophy: [C.red700, C.stone900],
    'Self-Help': [C.brass500, C.brass900],
    Reference: [C.slate700, C.slate900],
  }
  const [top, bottom] = palettes[category] || palettes.Fiction
  const bandH = Math.round(h * 0.58)
  const titleSize = w < 80 ? 8 : 9.5
  return `${rect(x, y, w, h, { fill: bottom, rx: 6 })}${rect(x, y, w, bandH, {
    fill: top,
    rx: 6,
  })}${rect(x, y + bandH - 6, w, 6, { fill: top })}${rect(x, y, 5, h, {
    fill: '#000000',
    opacity: 0.18,
    rx: 3,
  })}${text(x + 10, y + 16, category.toUpperCase(), {
    size: 6.4,
    weight: 700,
    fill: C.cream100,
    opacity: 0.75,
    letter: 0.6,
  })}${wrap(x + 10, y + 34, title, Math.floor((w - 18) / (titleSize * 0.52)), 11, {
    size: titleSize,
    weight: 700,
    fill: C.cream50,
    family: DISPLAY,
  })}${author ? text(x + 10, y + h - 12, author, { size: 6.2, fill: C.cream100, opacity: 0.7 }) : ''}${line(
    x + 10,
    y + h - 20,
    x + w - 10,
    y + h - 20,
    { stroke: C.cream100, opacity: 0.25 },
  )}`
}

export function tableFrame(x, y, w, h, cols, options = {}) {
  const { headerH = 44 } = options
  let out = card(x, y, w, h)
  out += rect(x, y, w, headerH, { fill: C.cream50, rx: 16 })
  out += rect(x, y + headerH - 16, w, 16, { fill: C.cream50 })
  out += line(x, y + headerH, x + w, y + headerH, { stroke: C.cream300 })
  cols.forEach((col) => {
    const anchor = col.align || 'start'
    const cx = anchor === 'end' ? x + col.x : anchor === 'center' ? x + col.x : x + col.x
    out += text(cx, y + 27, col.label.toUpperCase(), {
      size: 9.5,
      weight: 700,
      fill: C.inkFaint,
      letter: 1,
      anchor,
    })
  })
  return out
}

export function tableRowDivider(x, y, w) {
  return line(x, y, x + w, y, { stroke: C.cream200 })
}

export function dim() {
  return rect(0, 0, W, H, { fill: C.forest950, opacity: 0.55 })
}

export function modal(x, y, w, h, options = {}) {
  const { title, description, footer = true } = options
  let out = `${dim()}${rect(x, y, w, h, { fill: C.white, rx: 20 })}`
  out += text(x + 28, y + 40, title, { size: 21, weight: 600, family: DISPLAY, fill: C.ink })
  if (description) out += wrap(x + 28, y + 66, description, Math.floor((w - 56) / 6.5), 18, { size: 12.5, fill: C.inkMuted })
  out += line(x, y + h - 68, x + w, y + h - 68, { stroke: C.cream200 })
  if (footer) {
    out += button(x + w - 28 - 110, y + h - 52, 'Cancel', { variant: 'secondary', w: 110 })
    out += button(x + w - 28 - 110 - 10 - 140, y + h - 52, 'Confirm', { w: 140 })
  }
  return out
}

// ---------------------------------------------------------------- shell

const NAV = {
  student: [
    {
      label: 'Library',
      items: [
        ['Dashboard', 'dashboard'],
        ['Browse catalog', 'library'],
        ['My loans', 'bookmark'],
        ['My fines', 'receipt'],
      ],
    },
    { label: 'Account', items: [['Profile & settings', 'user']] },
  ],
  librarian: [
    {
      label: 'Operations',
      items: [
        ['Dashboard', 'dashboard'],
        ['Borrow requests', 'inbox'],
        ['Books', 'library'],
        ['Borrow & return', 'bookopen'],
        ['Students', 'users'],
        ['Fines', 'receipt'],
      ],
    },
    { label: 'Account', items: [['Profile & settings', 'user']] },
  ],
  super: [
    {
      label: 'Administration',
      items: [
        ['Dashboard', 'dashboard'],
        ['Librarian accounts', 'shield'],
      ],
    },
    {
      label: 'Oversight',
      items: [
        ['Borrow requests', 'inbox'],
        ['Books', 'library'],
        ['Borrow & return', 'bookopen'],
        ['Students', 'users'],
        ['Fines', 'receipt'],
      ],
    },
    { label: 'Account', items: [['Profile & settings', 'user']] },
  ],
}

export function brand(x, y, options = {}) {
  const { dark = false, compact = false, size = 36 } = options
  const bg = dark ? C.cream100 : C.forest800
  const fg = dark ? C.forest900 : C.cream50
  let out = rect(x, y, size, size, { fill: bg, rx: 12 })
  out += icon('bookopen', x + size / 2 - 9, y + size / 2 - 9, 18, fg, 2)
  out += text(x + size + 10, y + 16, 'Libris', {
    size: 20,
    weight: 600,
    family: DISPLAY,
    fill: dark ? C.cream50 : C.ink,
  })
  if (!compact) {
    out += text(x + size + 10, y + 30, 'LIBRARY BORROWING SYSTEM', {
      size: 7.5,
      weight: 700,
      fill: dark ? 'rgba(250,247,241,0.5)' : C.inkFaint,
      letter: 1.35,
    })
  }
  return out
}

export function avatarFor(role) {
  if (role === 'librarian') return { initials: 'ML', role: 'librarian' }
  if (role === 'super') return { initials: 'AR', role: 'super' }
  return { initials: 'JD', role: 'student' }
}

export function appShell({ role = 'student', active = 'Dashboard', content = '', user, date = 'Thursday, November 5' }) {
  const nav = NAV[role] || NAV.student
  const profile =
    user ||
    {
      student: { name: 'Juan Dela Cruz', label: 'Student' },
      librarian: { name: 'Maria Lopez', label: 'Librarian' },
      super: { name: 'Aurora Reyes', label: 'Super Librarian' },
    }[role]

  let out = rect(0, 0, W, H, { fill: C.bg })

  // sidebar
  out += rect(0, 0, SIDEBAR, H, { fill: C.forest950 })
  out += line(0, 64, SIDEBAR, 64, { stroke: '#FFFFFF', opacity: 0.1 })
  out += brand(20, 14, { dark: true })
  let cy = 88
  nav.forEach((section) => {
    out += text(24, cy, section.label.toUpperCase(), {
      size: 9,
      weight: 700,
      fill: 'rgba(250,247,241,0.35)',
      letter: 1.6,
    })
    cy += 14
    section.items.forEach(([label, iconName]) => {
      const isActive = label === active
      if (isActive) {
        out += rect(12, cy, 232, 40, { fill: 'rgba(255,255,255,0.10)', rx: 12 })
      }
      out += icon(iconName, 24, cy + 11, 18, isActive ? C.brass300 : 'rgba(250,247,241,0.45)')
      out += text(52, cy + 25, label, {
        size: 13.5,
        weight: 500,
        fill: isActive ? C.cream50 : 'rgba(250,247,241,0.65)',
      })
      if (isActive) out += circle(230, cy + 20, 3, { fill: C.brass400 })
      cy += 44
    })
    cy += 18
  })

  // user panel
  out += line(0, H - 76, SIDEBAR, H - 76, { stroke: '#FFFFFF', opacity: 0.1 })
  out += rect(12, H - 64, 232, 52, { fill: 'rgba(255,255,255,0.05)', rx: 12 })
  out += avatar(24, H - 56, 32, avatarFor(role))
  out += text(64, H - 42, profile.name, { size: 13, weight: 600, fill: C.cream50 })
  out += text(64, H - 28, profile.label.toUpperCase(), {
    size: 8,
    weight: 700,
    fill: 'rgba(250,247,241,0.45)',
    letter: 1.2,
  })
  out += icon('logout', 214, H - 46, 16, 'rgba(250,247,241,0.5)')

  // top bar
  out += rect(SIDEBAR, 0, W - SIDEBAR, 64, { fill: C.cream100 })
  out += line(SIDEBAR, 64, W, 64, { stroke: C.cream300 })
  out += text(1160, 38, date, { size: 12.5, fill: C.inkMuted, anchor: 'end' })
  out += line(1176, 22, 1176, 42, { stroke: C.cream300 })
  out += rect(1192, 12, 190, 40, { fill: C.white, stroke: C.cream300, rx: 20 })
  out += avatar(1198, 16, 32, avatarFor(role))
  out += text(1238, 30, profile.name, { size: 12, weight: 600, fill: C.ink })
  out += text(1238, 43, profile.label.toUpperCase(), {
    size: 8,
    weight: 700,
    fill: C.inkFaint,
    letter: 1.1,
  })
  out += icon('logout', 1398, 24, 17, C.inkFaint)

  // main content
  out += `<g transform="translate(${MAIN_X} 96)">${content}</g>`

  // footer
  out += line(MAIN_X, 866, 1408, 866, { stroke: C.cream200 })
  out += text(MAIN_X, 884, 'Libris Library Borrowing System', { size: 10.5, fill: C.inkFaint })
  out += text(1408, 884, 'Libris College Library · Mon–Sat, 8:00–17:00', {
    size: 10.5,
    fill: C.inkFaint,
    anchor: 'end',
  })

  return out
}

export function publicNav({ active = '' } = {}) {
  let out = rect(0, 0, W, 80, { fill: C.cream100 })
  out += line(0, 80, W, 80, { stroke: C.cream300 })
  out += brand(40, 22)
  const links = ['Catalog', 'How it works', 'Borrowing rules']
  let x = 760
  links.forEach((label) => {
    out += text(x, 47, label, { size: 13, weight: 500, fill: active === label ? C.forest800 : C.inkMuted })
    x += label.length * 7 + 32
  })
  out += button(1176, 20, 'Sign in', { variant: 'secondary', w: 96 })
  out += button(1284, 20, 'Create account', { w: 124 })
  return out
}

export function publicFooter(y = 842) {
  let out = line(40, y, 1400, y, { stroke: C.cream300 })
  out += text(40, y + 26, '© 2026 Libris College Library', { size: 11, fill: C.inkFaint })
  out += text(1400, y + 26, 'Mon–Sat, 8:00–17:00 · library@libris.edu.ph · (02) 8123 4567', {
    size: 11,
    fill: C.inkFaint,
    anchor: 'end',
  })
  return out
}
