import {
  C,
  DISPLAY,
  rect,
  circle,
  line,
  text,
  wrap,
  icon,
  badge,
  button,
  avatar,
  card,
  statCard,
  pageHeader,
  searchField,
  selectField,
  bookCover,
  appShell,
  brand,
  textField,
  tableRowDivider,
  publicFooter,
} from './kit.mjs'

const user = { name: 'Aurora Reyes', label: 'Super Librarian' }

function miniStat(x, y, w, { label, value, iconName, tone = 'forest', hint }) {
  const tones = {
    forest: [C.forest50, C.forest700],
    brass: [C.brass50, C.brass700],
    red: [C.red50, C.red600],
    cream: [C.cream100, C.inkSoft],
  }
  const [bg, fg] = tones[tone] || tones.forest
  let out = card(x, y, w, 92, { rx: 14 })
  out += rect(x + 16, y + 22, 38, 38, { fill: bg, rx: 10 })
  out += icon(iconName, x + 26, y + 32, 18, fg)
  out += text(x + 66, y + 38, label.toUpperCase(), { size: 8.5, weight: 700, fill: C.inkFaint, letter: 1 })
  out += text(x + 66, y + 64, value, { size: 24, weight: 600, family: DISPLAY, fill: C.ink })
  if (hint) out += text(x + 66, y + 80, hint, { size: 9, fill: C.inkFaint })
  return out
}

export const superScreens = [
  {
    id: '19-super-dashboard',
    group: 'Superlibrarian',
    title: 'Superlibrarian dashboard',
    note: 'Librarian accounts on the left, oversight shortcuts on the right.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Administration',
        title: 'Good afternoon, Aurora',
        description: 'The desk is covered. One librarian account still needs to finish setup.',
        actions: [
          { label: 'Add librarian', iconName: 'plus', w: 136 },
          { label: 'Borrow requests', variant: 'secondary', iconName: 'inbox', w: 156 },
        ],
      })

      c += statCard(0, 92, 268, { label: 'Librarian accounts', value: '2', hint: '1 active · 1 setup pending', iconName: 'shield', tone: 'forest' })
      c += statCard(284, 92, 268, { label: 'Pending requests', value: '2', hint: 'Oldest waiting 2 days', iconName: 'inbox', tone: 'brass' })
      c += statCard(568, 92, 268, { label: 'Active loans', value: '8', hint: '2 overdue right now', iconName: 'bookopen', tone: 'cream' })
      c += statCard(852, 92, 268, { label: 'Unpaid fines', value: '₱85', hint: 'Across 3 students', iconName: 'receipt', tone: 'red' })

      // Librarian accounts
      c += card(0, 234, 640, 474)
      c += text(24, 268, 'Librarian accounts', { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(24, 288, 'Who can operate the circulation desk.', { size: 10.5, fill: C.inkFaint })
      c += text(616, 268, 'Manage accounts', { size: 11, weight: 600, fill: C.forest700, anchor: 'end' })
      c += line(0, 304, 640, 304, { stroke: C.cream200 })

      c += text(24, 330, 'LIBRARIAN', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(452, 330, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(616, 330, 'PROCESSED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1, anchor: 'end' })

      const librarians = [
        ['Maria Lopez', 'maria.lopez@library.test', 'ML', 'Active', 'success', '46 loans'],
        ['Daniel Cruz', 'daniel.cruz@library.test', 'DC', 'Setup pending', 'warning', '—'],
      ]
      librarians.forEach(([name, email, initials, status, tone, processed], index) => {
        const y = 348 + index * 78
        c += avatar(24, y + 8, 38, { initials, role: 'librarian' })
        c += text(74, y + 24, name, { size: 12.5, weight: 600, fill: C.ink })
        c += text(74, y + 40, email, { size: 9.5, fill: C.inkFaint })
        c += badge(452, y + 16, status, { tone })
        c += text(616, y + 25, processed, { size: 11, fill: C.inkMuted, anchor: 'end' })
        if (status === 'Setup pending') c += text(616, y + 40, 'First sign-in required', { size: 8.5, fill: C.brass700, anchor: 'end' })
        if (index < librarians.length - 1) c += tableRowDivider(24, y + 62, 592)
      })

      c += rect(24, 520, 592, 108, { fill: C.cream50, stroke: C.cream200, rx: 12 })
      c += circle(56, 552, 18, { fill: C.brass50 })
      c += icon('mailcheck', 46, 542, 20, C.brass700)
      c += text(86, 550, 'Daniel has not completed first sign-in', { size: 11.5, weight: 600, fill: C.ink })
      c += wrap(86, 568, 'The account was created with a temporary password. They will be asked to choose a new one at first sign-in.', 58, 15, { size: 9.5, fill: C.inkMuted })
      c += text(24, 686, '2 accounts · 1 pending setup · 0 suspended', { size: 9.5, fill: C.inkFaint })
      c += text(616, 686, 'Superlibrarians are managed separately.', { size: 9, fill: C.inkFaint, anchor: 'end' })

      // Oversight shortcuts
      c += card(664, 234, 456, 474)
      c += text(688, 268, 'Oversight shortcuts', { size: 20, weight: 600, family: DISPLAY, fill: C.ink })
      c += text(688, 288, 'Step into any part of daily operations.', { size: 10.5, fill: C.inkFaint })
      c += line(664, 304, 1120, 304, { stroke: C.cream200 })

      const shortcuts = [
        ['inbox', 'Borrow requests', '2 waiting for approval', 'brass', '2'],
        ['library', 'Catalog', '24 copies · 2 off the shelf', 'forest', null],
        ['bookopen', 'Borrow & return', '8 active loans · 2 overdue', 'forest', null],
        ['users', 'Students', '8 registered borrowers', 'cream', null],
        ['receipt', 'Fines', '₱85 outstanding', 'red', null],
      ]
      shortcuts.forEach(([iconName, title, hint, tone, count], index) => {
        const y = 320 + index * 62
        const tones = {
          forest: [C.forest50, C.forest700],
          brass: [C.brass50, C.brass700],
          red: [C.red50, C.red600],
          cream: [C.cream100, C.inkSoft],
        }
        const [bg, fg] = tones[tone]
        c += rect(688, y + 6, 408, 52, { fill: C.cream50, stroke: C.cream200, rx: 10 })
        c += rect(698, y + 16, 32, 32, { fill: bg, rx: 8 })
        c += icon(iconName, 706, y + 24, 16, fg)
        c += text(742, y + 28, title, { size: 11.5, weight: 600, fill: C.ink })
        c += text(742, y + 44, hint, { size: 9.5, fill: C.inkFaint })
        if (count) c += badge(1064, y + 20, count, { tone: 'warning', anchor: 'end' })
        c += icon('arrowright', 1074, y + 27, 14, C.inkFaint)
      })

      c += text(688, 664, 'You have full oversight of loans, books and students.', { size: 9.5, fill: C.inkFaint })
      c += text(688, 682, 'Changes are attributed to your account.', { size: 9.5, fill: C.inkFaint })

      return appShell({ role: 'super', active: 'Dashboard', content: c, user })
    },
  },
  {
    id: '20-librarian-accounts',
    group: 'Superlibrarian',
    title: 'Librarian accounts',
    note: 'Create, edit and remove staff accounts. New accounts must change the temporary password.',
    render() {
      let c = pageHeader(0, 0, 1120, {
        eyebrow: 'Administration',
        title: 'Librarian accounts',
        description: 'Create, edit and remove librarian accounts. Superlibrarian accounts are managed separately.',
        actions: [{ label: 'Add a librarian', iconName: 'plus', w: 152 }],
      })

      c += miniStat(0, 92, 360, { label: 'Librarian accounts', value: '2', iconName: 'shield', tone: 'forest', hint: '1 active · 1 pending' })
      c += miniStat(380, 92, 360, { label: 'Loans processed', value: '46', iconName: 'bookopen', tone: 'brass', hint: 'By current librarians' })
      c += miniStat(760, 92, 360, { label: 'Pending setup', value: '1', iconName: 'mailcheck', tone: 'cream', hint: 'Temporary password issued' })

      c += card(0, 200, 1120, 344)
      c += rect(0, 200, 1120, 44, { fill: C.cream50, rx: 16 })
      c += rect(0, 228, 1120, 16, { fill: C.cream50 })
      c += text(24, 227, 'LIBRARIAN', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(420, 227, 'EMAIL', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(704, 227, 'STATUS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(836, 227, 'PROCESSED', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(952, 227, 'LAST SIGN-IN', { size: 9, weight: 700, fill: C.inkFaint, letter: 1 })
      c += text(1096, 227, 'ACTIONS', { size: 9, weight: 700, fill: C.inkFaint, letter: 1, anchor: 'end' })
      c += line(0, 244, 1120, 244, { stroke: C.cream300 })

      const librarians = [
        ['Maria Lopez', 'maria.lopez@library.test', 'ML', 'Active', 'success', '46 loans', 'Today, 08:12'],
        ['Daniel Cruz', 'daniel.cruz@library.test', 'DC', 'Setup pending', 'warning', '—', 'Never'],
      ]
      librarians.forEach((row, index) => {
        const y = 258 + index * 84
        c += avatar(24, y + 14, 40, { initials: row[2], role: 'librarian' })
        c += text(76, y + 30, row[0], { size: 12.5, weight: 600, fill: C.ink })
        c += text(76, y + 46, 'Staff account', { size: 9, fill: C.inkFaint })
        c += text(420, y + 38, row[1], { size: 10.5, fill: C.inkMuted })
        c += badge(704, y + 24, row[3], { tone: row[4] })
        c += text(836, y + 38, row[5], { size: 10.5, fill: C.inkMuted })
        c += text(952, y + 38, row[6], { size: 10, fill: C.inkMuted })
        c += button(1044, y + 22, 'Edit', { variant: 'secondary', w: 52, h: 28, size: 10 })
        c += icon('trash', 1096, y + 30, 15, C.inkFaint)
        if (index < librarians.length - 1) c += tableRowDivider(24, y + 68, 1072)
      })

      c += rect(24, 430, 1072, 92, { fill: C.cream50, stroke: C.cream200, rx: 12 })
      c += icon('info', 40, 452, 18, C.inkMuted)
      c += text(68, 462, 'New librarians receive a temporary password', { size: 11.5, weight: 600, fill: C.ink })
      c += wrap(68, 480, 'They must choose a new password at first sign-in. Deleting an account keeps its past checkout records as “Former librarian”.', 118, 15, { size: 9.5, fill: C.inkMuted })
      c += button(940, 456, 'Manage permissions', { variant: 'secondary', w: 140, h: 32, size: 11 })

      // Lifecycle
      c += text(0, 582, 'Account lifecycle', { size: 18, weight: 600, family: DISPLAY, fill: C.ink })
      const steps = [
        ['01', 'Create the account', 'Name and email are all that is required.'],
        ['02', 'Share the temporary password', 'The librarian signs in and chooses a new one.'],
        ['03', 'Full desk access', 'Books, loans, requests, students and fines.'],
      ]
      steps.forEach(([number, title, body], index) => {
        const x = index * 380
        c += rect(x, 602, 360, 108, { fill: C.white, stroke: C.cream300, rx: 14 })
        c += circle(x + 28, 632, 13, { fill: C.forest50 })
        c += text(x + 28, 636, number, { size: 8.5, weight: 700, fill: C.forest700, anchor: 'middle' })
        c += text(x + 52, 637, title, { size: 11.5, weight: 600, fill: C.ink })
        c += wrap(x + 20, 668, body, 44, 15, { size: 9.5, fill: C.inkMuted })
      })

      return appShell({ role: 'super', active: 'Librarian accounts', content: c, user })
    },
  },
  {
    id: '21-change-password',
    group: 'Access',
    title: 'First sign-in password change',
    note: 'Mandatory password update after a librarian receives a temporary credential.',
    render() {
      let out = rect(0, 0, 1440, 900, { fill: C.cream100 })
      out += circle(1180, 120, 320, { fill: C.forest100, opacity: 0.5 })
      out += circle(140, 780, 240, { fill: C.brass100, opacity: 0.4 })
      out += brand(40, 26)

      out += text(40, 122, 'ACCOUNT SETUP', { size: 9.5, weight: 700, fill: C.brass700, letter: 1.8 })
      out += text(40, 172, 'One last step', { size: 40, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(40, 204, 'before you open the desk.', { size: 40, weight: 600, family: DISPLAY, fill: C.forest700, italic: true })
      out += wrap(
        40,
        244,
        'Your account was created with a temporary password. Choose a private one now — you will use it every time you sign in.',
        52,
        21,
        { size: 13, fill: C.inkMuted },
      )

      const bullets = [
        ['shield', 'Only you will know the new password'],
        ['key', 'Temporary passwords stop working after this step'],
        ['clock', 'It takes less than a minute'],
      ]
      bullets.forEach(([iconName, label], index) => {
        const y = 330 + index * 52
        out += circle(56, y + 12, 16, { fill: C.white, stroke: C.cream300 })
        out += icon(iconName, 47, y + 3, 18, C.forest700)
        out += text(84, y + 17, label, { size: 12, fill: C.inkSoft })
      })

      out += rect(40, 520, 440, 116, { fill: C.white, stroke: C.cream300, rx: 16 })
      out += avatar(60, 542, 38, { initials: 'DC', role: 'librarian' })
      out += text(112, 558, 'Daniel Cruz', { size: 12.5, weight: 600, fill: C.ink })
      out += text(112, 574, 'daniel.cruz@library.test', { size: 10, fill: C.inkFaint })
      out += badge(112, 584, 'Librarian · setup pending', { tone: 'warning' })
      out += text(60, 618, 'Signing in from Libris College Library · Chrome on Windows', { size: 9, fill: C.inkFaint })

      out += publicFooter(842)

      // Card
      out += card(680, 112, 620, 668, { rx: 24 })
      out += rect(716, 148, 44, 44, { fill: C.forest50, rx: 12 })
      out += icon('lock', 728, 160, 20, C.forest700)
      out += text(716, 230, 'Set a new password', { size: 28, weight: 600, family: DISPLAY, fill: C.ink })
      out += text(716, 254, 'You will use this password from now on.', { size: 12, fill: C.inkMuted })

      out += rect(716, 278, 548, 40, { fill: C.brass50, stroke: C.brass200, rx: 10 })
      out += icon('alert', 730, 290, 16, C.brass700)
      out += text(754, 303, 'First sign-in detected — a new password is required.', { size: 10.5, fill: C.brass900 })

      out += textField(716, 344, 548, { label: 'Current temporary password', value: '••••••••••', iconName: 'lock' })
      out += textField(716, 424, 548, { label: 'New password', value: '••••••••••', iconName: 'lock' })
      out += icon('eye', 1210, 464, 16, C.inkFaint)
      out += textField(716, 504, 548, { label: 'Confirm new password', value: '••••••••••', iconName: 'lock' })
      out += icon('eye', 1210, 544, 16, C.inkFaint)

      out += text(716, 578, 'PASSWORD STRENGTH', { size: 8.5, weight: 700, fill: C.inkFaint, letter: 1.2 })
      const segments = [C.forest600, C.forest600, C.forest600, C.cream300]
      segments.forEach((fill, index) => {
        out += rect(716 + index * 139, 588, 128, 6, { fill, rx: 3 })
      })
      out += text(1264, 594, 'Strong', { size: 9, weight: 600, fill: C.forest700, anchor: 'end' })

      const checks = [
        'At least 8 characters',
        'One uppercase letter and one number',
        'Different from the temporary password',
        'Not used on another account',
      ]
      checks.forEach((label, index) => {
        const y = 626 + index * 22
        out += icon('check', 716, y - 11, 14, index === 3 ? C.inkFaint : C.forest600, 2.2)
        out += text(738, y, label, { size: 10.5, fill: index === 3 ? C.inkFaint : C.inkSoft })
      })

      out += button(716, 722, 'Save password & continue', { h: 46, w: 548 })
      out += icon('arrowright', 1206, 737, 17, C.cream50)
      out += text(990, 792, 'Need help? Ask the superlibrarian.', { size: 9.5, fill: C.inkFaint, anchor: 'middle' })

      return out
    },
  },
]
